<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierPaymentApiController extends Controller
{
    private const STATUTS = ['Inst', 'Payé', 'Report', 'Imp', 'Dévalidé'];

    public function index(Request $request)
    {
        $query = SupplierPayment::with(['supplier', 'allocations.purchaseOrder']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('numero')) {
            $query->where('numero', 'like', '%'.$request->numero.'%');
        }
        if ($request->filled('banque')) {
            $query->where('banque', $request->banque);
        }
        if ($request->filled('montant')) {
            $query->where('montant', (float) str_replace(',', '.', $request->montant));
        }
        if ($request->filled('mois')) {
            // mois = YYYY-MM
            $mois = $request->mois;
            if (preg_match('/^\d{4}-\d{2}$/', $mois)) {
                [$year, $month] = explode('-', $mois);
                $query->whereYear('payment_date', $year)->whereMonth('payment_date', $month);
            }
        }

        $payments = $query->latest('payment_date')->latest('id')->get();

        $allForTotals = SupplierPayment::query();
        $totalReglement = round((float) (clone $allForTotals)->sum('montant'), 2);
        $totalDecaisse = round((float) (clone $allForTotals)->where('statut', 'Payé')->sum('montant'), 2);
        $totalImpaye = round((float) (clone $allForTotals)->where('statut', 'Imp')->sum('montant'), 2);

        return response()->json([
            'data' => $payments->map(fn ($p) => $this->formatPayment($p))->values()->all(),
            'meta' => [
                'total_reglement' => number_format($totalReglement, 2, '.', ''),
                'total_decaisse' => number_format($totalDecaisse, 2, '.', ''),
                'total_impaye' => number_format($totalImpaye, 2, '.', ''),
            ],
        ]);
    }

    public function show(SupplierPayment $supplierPayment)
    {
        return response()->json([
            'data' => $this->formatPayment($supplierPayment->load(['supplier', 'allocations.purchaseOrder'])),
        ]);
    }

    public function meta()
    {
        return response()->json([
            'next_ref' => $this->nextReference(),
            'date' => now()->format('d/m/Y'),
            'date_raw' => now()->format('Y-m-d'),
            'statuts' => self::STATUTS,
        ]);
    }

    public function orders(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $orders = PurchaseOrder::with('supplier')
            ->where('supplier_id', $request->supplier_id)
            ->where('status', '!=', 'annule')
            ->latest('order_date')
            ->get()
            ->map(fn ($o) => $this->formatOrder($o));

        $totalTtc = round($orders->sum(fn ($o) => (float) $o['montant_bon']), 2);
        $soldeTtc = round($orders->sum(fn ($o) => (float) $o['solde']), 2);

        return response()->json([
            'data' => $orders,
            'meta' => [
                'total_ttc' => number_format($totalTtc, 2, '.', ''),
                'solde_ttc' => number_format($soldeTtc, 2, '.', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'reglement' => 'nullable|in:Esp,Chq,Eff,Vir,Vers',
            'numero' => 'nullable|string|max:50',
            'banque' => 'nullable|string|max:100',
            'nom_tire' => 'nullable|string|max:150',
            'montant' => 'required|numeric|min:0.01',
            'date_decaissement' => 'nullable|date',
            'remarque' => 'nullable|string|max:1000',
            'statut' => 'nullable|in:'.implode(',', self::STATUTS),
            'allocations' => 'required|array|min:1',
            'allocations.*.purchase_order_id' => 'required|exists:purchase_orders,id',
            'allocations.*.amount' => 'nullable|numeric|min:0',
            'allocations.*.action' => 'nullable|in:Inst,Payé,Report,Imp,Dévalidé',
        ]);

        $payment = DB::transaction(function () use ($validated, $request) {
            $orderIds = collect($validated['allocations'])->pluck('purchase_order_id')->all();
            $orders = PurchaseOrder::whereIn('id', $orderIds)
                ->where('supplier_id', $validated['supplier_id'])
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($orders->count() !== count($orderIds)) {
                abort(422, 'Certaines commandes sont invalides pour ce fournisseur');
            }

            $paymentAmount = round((float) $validated['montant'], 2);
            $remaining = $paymentAmount;
            $built = [];

            foreach ($validated['allocations'] as $row) {
                $order = $orders->get($row['purchase_order_id']);
                $action = $row['action'] ?? 'Payé';
                $due = round(max((float) $order->total_ttc - (float) ($order->montant_paye ?? 0), 0), 2);

                $explicit = array_key_exists('amount', $row) && $row['amount'] !== null && $row['amount'] !== ''
                    ? round((float) $row['amount'], 2)
                    : null;

                if ($explicit !== null) {
                    $applied = $explicit;
                } elseif ($action === 'Payé') {
                    $applied = round(min($due, $remaining), 2);
                } else {
                    $applied = 0;
                }

                if ($applied > 0) {
                    $remaining = round($remaining - $applied, 2);
                }

                $built[] = [
                    'order' => $order,
                    'amount' => max($applied, 0),
                    'action' => $action,
                ];
            }

            $totalTtc = round($orders->sum(fn ($o) => (float) $o->total_ttc), 2);
            $soldeAvant = round($orders->sum(fn ($o) => max((float) $o->total_ttc - (float) ($o->montant_paye ?? 0), 0)), 2);

            $statut = $validated['statut'] ?? 'Inst';
            if (! empty($validated['date_decaissement']) && $statut === 'Inst') {
                $statut = 'Payé';
            }

            $payment = SupplierPayment::create([
                'reference' => 'RF-PENDING',
                'payment_date' => $validated['payment_date'],
                'supplier_id' => $validated['supplier_id'],
                'reglement' => $validated['reglement'] ?? null,
                'numero' => $validated['numero'] ?? null,
                'banque' => $validated['banque'] ?? null,
                'nom_tire' => $validated['nom_tire'] ?? null,
                'montant' => $paymentAmount,
                'date_decaissement' => $validated['date_decaissement'] ?? null,
                'remarque' => $validated['remarque'] ?? null,
                'total_ttc' => $totalTtc,
                'solde_ttc' => round($soldeAvant - $paymentAmount, 2),
                'statut' => $statut,
                'user_id' => $request->user()->id,
            ]);

            $payment->update(['reference' => $this->referenceFor($payment->id)]);

            foreach ($built as $row) {
                $payment->allocations()->create([
                    'purchase_order_id' => $row['order']->id,
                    'amount' => $row['amount'],
                    'action' => $row['action'],
                ]);

                $newPaid = round((float) ($row['order']->montant_paye ?? 0) + $row['amount'], 2);
                $orderTotal = (float) $row['order']->total_ttc;
                $action = $row['action'];

                if ($action === 'Payé' || ($newPaid + 0.009 >= $orderTotal && $orderTotal > 0)) {
                    $action = $newPaid + 0.009 >= $orderTotal ? 'Payé' : ($action ?: 'Inst');
                }

                $row['order']->update([
                    'montant_paye' => $newPaid,
                    'payment_action' => $action,
                ]);
            }

            return $payment->fresh(['supplier', 'allocations.purchaseOrder']);
        });

        return response()->json([
            'message' => 'Règlement enregistré',
            'data' => $this->formatPayment($payment),
        ], 201);
    }

    public function update(Request $request, SupplierPayment $supplierPayment)
    {
        $validated = $request->validate([
            'payment_date' => 'sometimes|required|date',
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'reglement' => 'nullable|in:Esp,Chq,Eff,Vir,Vers',
            'numero' => 'nullable|string|max:50',
            'banque' => 'nullable|string|max:100',
            'nom_tire' => 'nullable|string|max:150',
            'montant' => 'sometimes|required|numeric|min:0.01',
            'date_decaissement' => 'nullable|date',
            'remarque' => 'nullable|string|max:1000',
            'statut' => 'nullable|in:'.implode(',', self::STATUTS),
        ]);

        $supplierPayment->update($validated);

        return response()->json([
            'message' => 'Règlement mis à jour',
            'data' => $this->formatPayment($supplierPayment->fresh(['supplier', 'allocations.purchaseOrder'])),
        ]);
    }

    public function updateStatut(Request $request, SupplierPayment $supplierPayment)
    {
        $validated = $request->validate([
            'statut' => 'required|in:'.implode(',', self::STATUTS),
        ]);

        $supplierPayment->update(['statut' => $validated['statut']]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'data' => $this->formatPayment($supplierPayment->fresh(['supplier', 'allocations.purchaseOrder'])),
        ]);
    }

    public function updateAction(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'payment_action' => 'required|in:Inst,Payé,Report,Imp,Dévalidé',
        ]);

        $purchaseOrder->update(['payment_action' => $validated['payment_action']]);

        return response()->json($this->formatOrder($purchaseOrder->fresh('supplier')));
    }

    public function destroy(SupplierPayment $supplierPayment)
    {
        DB::transaction(function () use ($supplierPayment) {
            $supplierPayment->load('allocations.purchaseOrder');

            foreach ($supplierPayment->allocations as $allocation) {
                $order = $allocation->purchaseOrder;
                if ($order) {
                    $order->update([
                        'montant_paye' => round(max((float) ($order->montant_paye ?? 0) - (float) $allocation->amount, 0), 2),
                    ]);
                }
                $allocation->delete();
            }

            $supplierPayment->delete();
        });

        return response()->json(['message' => 'Règlement supprimé']);
    }

    private function nextReference(): string
    {
        return $this->referenceFor((SupplierPayment::max('id') ?? 0) + 1);
    }

    private function referenceFor(int $id): string
    {
        return 'RF-'.str_pad((string) $id, 4, '0', STR_PAD_LEFT);
    }

    private function formatOrder(PurchaseOrder $order): array
    {
        $montantBon = round((float) $order->total_ttc, 2);
        $montantPaye = round((float) ($order->montant_paye ?? 0), 2);
        $solde = round($montantBon - $montantPaye, 2);

        return [
            'id' => $order->id,
            'reference' => $order->reference,
            'order_date' => $order->order_date?->format('d/m/Y'),
            'order_date_raw' => $order->order_date?->format('Y-m-d'),
            'supplier_id' => $order->supplier_id,
            'fournisseur' => $order->supplier?->name,
            'client_livre' => $order->client_livre,
            'montant_bon' => number_format($montantBon, 2, '.', ''),
            'montant_paye' => number_format($montantPaye, 2, '.', ''),
            'solde' => number_format($solde, 2, '.', ''),
            'payment_action' => $order->payment_action ?: 'Inst',
            'status' => $order->status,
        ];
    }

    private function formatPayment(SupplierPayment $payment): array
    {
        $payment->loadMissing(['supplier', 'allocations.purchaseOrder']);

        return [
            'id' => $payment->id,
            'reference' => $payment->reference,
            'payment_date' => $payment->payment_date?->format('d/m/Y'),
            'payment_date_raw' => $payment->payment_date?->format('Y-m-d'),
            'supplier_id' => $payment->supplier_id,
            'fournisseur' => $payment->supplier?->name,
            'reglement' => $payment->reglement,
            'numero' => $payment->numero,
            'banque' => $payment->banque,
            'nom_tire' => $payment->nom_tire,
            'montant' => number_format((float) $payment->montant, 2, '.', ''),
            'date_decaissement' => $payment->date_decaissement?->format('d/m/Y'),
            'date_decaissement_raw' => $payment->date_decaissement?->format('Y-m-d'),
            'remarque' => $payment->remarque,
            'total_ttc' => number_format((float) $payment->total_ttc, 2, '.', ''),
            'solde_ttc' => number_format((float) $payment->solde_ttc, 2, '.', ''),
            'statut' => $payment->statut ?: 'Inst',
            'allocations' => $payment->allocations->map(fn ($a) => [
                'id' => $a->id,
                'purchase_order_id' => $a->purchase_order_id,
                'bon' => $a->purchaseOrder?->reference,
                'amount' => number_format((float) $a->amount, 2, '.', ''),
                'action' => $a->action,
            ])->values()->all(),
        ];
    }
}
