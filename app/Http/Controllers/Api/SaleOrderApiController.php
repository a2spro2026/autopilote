<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientPayment;
use App\Models\SaleOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleOrderApiController extends Controller
{
    public function index(Request $request)
    {
        $query = SaleOrder::with(['client', 'items', 'user.role'])
            ->when($request->search, fn ($q, $s) => $q->where('reference', 'like', "%{$s}%")
                ->orWhere('designation', 'like', "%{$s}%"))
            ->when($request->filled('client_id'), fn ($q) => $q->where('client_id', $request->client_id))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->where('status', '!=', 'annule')
            ->latest('order_date');

        if ($request->boolean('all')) {
            $orders = $query->get()->map(fn ($o) => $this->formatOrder($o));

            return response()->json([
                'data' => $orders,
                'meta' => [
                    'next_ref' => $this->nextReference(),
                    'date' => now()->format('d/m/Y'),
                ],
            ]);
        }

        return response()->json($query->paginate(15)->through(fn ($o) => $this->formatOrder($o)));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $items = $this->normalizeItems($validated);

        $order = DB::transaction(function () use ($validated, $items, $request) {
            $subtotal = collect($items)->sum('total');
            $first = $items[0] ?? null;

            $order = SaleOrder::create([
                'client_id' => $validated['client_id'],
                'order_date' => $validated['order_date'],
                'bc_number' => $validated['bc_number'] ?? null,
                'reglement' => $validated['reglement'] ?? null,
                'echeance' => $validated['echeance'] ?? null,
                'city' => $validated['city'] ?? null,
                'address' => $validated['address'] ?? null,
                'chauffeur' => $validated['chauffeur'] ?? null,
                'matricule' => $validated['matricule'] ?? null,
                'designation' => $first['description'] ?? null,
                'article_ref' => $first['article_ref'] ?? null,
                'unit' => $first['unit'] ?? null,
                'unit_price' => $first['unit_price'] ?? 0,
                'quantity' => $first['quantity'] ?? 1,
                'reference' => 'BV-PENDING',
                'subtotal' => $subtotal,
                'total_ht' => $subtotal,
                'tva' => 0,
                'total_ttc' => $subtotal,
                'status' => $validated['status'] ?? 'valide',
                'user_id' => $request->user()->id,
            ]);

            $order->update(['reference' => $this->nextReference()]);
            $this->syncItems($order, $items);

            return $order->fresh(['client', 'items']);
        });

        return response()->json($this->formatOrder($order), 201);
    }

    public function show(SaleOrder $sales_order)
    {
        return response()->json($this->formatOrder($sales_order->load(['client', 'items'])));
    }

    public function update(Request $request, SaleOrder $sales_order)
    {
        $validated = $this->validated($request, true);
        $items = $this->normalizeItems($validated);
        $subtotal = collect($items)->sum('total');
        $first = $items[0] ?? null;

        DB::transaction(function () use ($sales_order, $validated, $items, $subtotal, $first) {
            $sales_order->update([
                'client_id' => $validated['client_id'] ?? $sales_order->client_id,
                'order_date' => $validated['order_date'] ?? $sales_order->order_date,
                'bc_number' => array_key_exists('bc_number', $validated) ? $validated['bc_number'] : $sales_order->bc_number,
                'reglement' => array_key_exists('reglement', $validated) ? $validated['reglement'] : $sales_order->reglement,
                'echeance' => array_key_exists('echeance', $validated) ? $validated['echeance'] : $sales_order->echeance,
                'city' => array_key_exists('city', $validated) ? $validated['city'] : $sales_order->city,
                'address' => array_key_exists('address', $validated) ? $validated['address'] : $sales_order->address,
                'chauffeur' => array_key_exists('chauffeur', $validated) ? $validated['chauffeur'] : $sales_order->chauffeur,
                'matricule' => array_key_exists('matricule', $validated) ? $validated['matricule'] : $sales_order->matricule,
                'designation' => $first['description'] ?? $sales_order->designation,
                'article_ref' => $first['article_ref'] ?? $sales_order->article_ref,
                'unit' => $first['unit'] ?? $sales_order->unit,
                'unit_price' => $first['unit_price'] ?? $sales_order->unit_price,
                'quantity' => $first['quantity'] ?? $sales_order->quantity,
                'subtotal' => $subtotal,
                'total_ht' => $subtotal,
                'tva' => 0,
                'total_ttc' => $subtotal,
                'status' => $validated['status'] ?? $sales_order->status,
            ]);

            $this->syncItems($sales_order, $items);
        });

        return response()->json($this->formatOrder($sales_order->fresh(['client', 'items'])));
    }

    public function validateOrder(SaleOrder $sales_order)
    {
        $sales_order->update(['status' => 'valide']);

        return response()->json($this->formatOrder($sales_order->fresh(['client', 'items', 'user.role'])));
    }

    /** Bons commercial : soldés ou en attente de solde (réception caisse). */
    public function caisseQueue()
    {
        $commercialIds = User::whereHas('role', fn ($q) => $q->where('slug', 'commercial'))
            ->pluck('id');

        $orders = SaleOrder::with(['client', 'items', 'user.role'])
            ->whereIn('status', ['valide', 'encaisse'])
            ->whereIn('user_id', $commercialIds)
            ->orderByDesc('order_date')
            ->orderByDesc('id')
            ->get();

        $lines = [];
        foreach ($orders as $order) {
            $commercialName = $order->user?->name ?: '—';
            $date = $order->order_date?->format('d/m/Y') ?? '—';
            $montantTtc = round((float) $order->total_ttc, 2);
            $montantPaye = round((float) ($order->montant_paye ?? 0), 2);
            $solde = round(max($montantTtc - $montantPaye, 0), 2);
            $isSolde = $solde <= 0.009 && $montantTtc > 0;

            $statusLabel = match (true) {
                $isSolde => 'Soldé',
                $order->status === 'valide' => 'Attente caisse',
                default => 'Attente de solde',
            };

            $items = $order->items->isNotEmpty()
                ? $order->items
                : collect([(object) [
                    'article_ref' => $order->article_ref,
                    'description' => $order->designation,
                    'quantity' => $order->quantity,
                    'unit_price' => $order->unit_price,
                    'total' => $order->subtotal,
                ]]);

            foreach ($items as $item) {
                $lines[] = [
                    'order_id' => $order->id,
                    'date' => $date,
                    'order_date_raw' => $order->order_date?->format('Y-m-d'),
                    'commercial_name' => $commercialName,
                    'client_id' => $order->client_id,
                    'client_name' => $order->client?->name ?: '—',
                    'numero_bon' => $order->reference,
                    'reference' => $item->article_ref ?? '—',
                    'designation' => $item->description ?? $order->designation ?? '—',
                    'quantity' => (float) ($item->quantity ?? 0),
                    'unit_price' => number_format((float) ($item->unit_price ?? 0), 2, '.', ''),
                    'sous_total' => number_format((float) ($item->total ?? 0), 2, '.', ''),
                    'montant_ttc' => number_format($montantTtc, 2, '.', ''),
                    'montant_paye' => number_format($montantPaye, 2, '.', ''),
                    'solde' => number_format($solde, 2, '.', ''),
                    'reglement' => $order->reglement,
                    'status' => $order->status,
                    'status_label' => $statusLabel,
                    'can_pay' => $solde > 0.009,
                    'can_encaisser' => $order->status === 'valide',
                ];
            }
        }

        return response()->json([
            'data' => $lines,
            'meta' => [
                'orders_count' => $orders->count(),
                'order_ids' => $orders->pluck('id')->values(),
                'pending_ids' => $orders->filter(function ($o) {
                    $solde = max((float) $o->total_ttc - (float) ($o->montant_paye ?? 0), 0);

                    return $solde > 0.009;
                })->pluck('id')->values(),
            ],
        ]);
    }

    /** Encaissement caisse d'un ou plusieurs bons validés commercial. */
    public function encaisser(Request $request)
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'integer|exists:sales_orders,id',
        ]);

        $commercialIds = User::whereHas('role', fn ($q) => $q->where('slug', 'commercial'))
            ->pluck('id');

        $updated = SaleOrder::query()
            ->whereIn('id', $validated['order_ids'])
            ->where('status', 'valide')
            ->whereIn('user_id', $commercialIds)
            ->update([
                'status' => 'encaisse',
                'reglement' => DB::raw("COALESCE(NULLIF(reglement, ''), 'Esp')"),
            ]);

        return response()->json([
            'message' => 'Bons encaissés',
            'updated' => $updated,
        ]);
    }

    /** Paiement caisse d'un bon (Esp / TPE / Vir / Chq / Eff / Crédit / Vers). */
    public function payer(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:sales_orders,id',
            'payment_date' => 'required|date',
            'reglement' => 'required|in:Esp,TPE,Vir,Chq,Eff,Crédit,Vers',
            'numero' => 'nullable|string|max:50',
            'banque' => 'nullable|string|max:100',
            'nom_tire' => 'nullable|string|max:150',
            'date_encaissement' => 'nullable|date',
        ]);

        if (in_array($validated['reglement'], ['Chq', 'Eff'], true)) {
            $request->validate([
                'numero' => 'required|string|max:50',
                'banque' => 'required|string|max:100',
                'nom_tire' => 'required|string|max:150',
                'date_encaissement' => 'required|date',
            ]);
        }

        $commercialIds = User::whereHas('role', fn ($q) => $q->where('slug', 'commercial'))
            ->pluck('id');

        $order = SaleOrder::with('client')
            ->where('id', $validated['order_id'])
            ->whereIn('status', ['valide', 'encaisse'])
            ->whereIn('user_id', $commercialIds)
            ->firstOrFail();

        $due = round(max((float) $order->total_ttc - (float) ($order->montant_paye ?? 0), 0), 2);
        if ($due <= 0) {
            return response()->json(['message' => 'Ce bon est déjà soldé'], 422);
        }

        $payment = DB::transaction(function () use ($validated, $order, $request, $due) {
            $amount = $due;
            $dateEncaisse = $validated['date_encaissement'] ?? null;
            $isChequeLike = in_array($validated['reglement'], ['Chq', 'Eff'], true);
            $newPaid = round((float) ($order->montant_paye ?? 0) + $amount, 2);
            $remaining = round(max((float) $order->total_ttc - $newPaid, 0), 2);

            $payment = ClientPayment::create([
                'reference' => 'RC-PENDING',
                'payment_date' => $validated['payment_date'],
                'client_id' => $order->client_id,
                'client_name' => $order->client?->name,
                'ville_chantier' => $order->city,
                'chantier_type' => null,
                'montant_total' => (float) $order->total_ttc,
                'reglement' => $validated['reglement'],
                'numero' => $isChequeLike ? ($validated['numero'] ?? null) : null,
                'banque' => $isChequeLike ? ($validated['banque'] ?? null) : null,
                'nom_tire' => $isChequeLike ? ($validated['nom_tire'] ?? null) : null,
                'montant' => $amount,
                'date_decaissement' => $dateEncaisse,
                'remarque' => 'Paiement caisse — '.$order->reference,
                'solde' => $remaining,
                'statut' => $dateEncaisse || ! $isChequeLike ? 'Payé' : 'Inst',
                'user_id' => $request->user()->id,
            ]);

            $payment->update(['reference' => 'RC-'.str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT)]);

            $payment->allocations()->create([
                'sales_order_id' => $order->id,
                'client_order_id' => null,
                'amount' => $amount,
                'action' => 'Payé',
            ]);

            $order->update([
                'status' => 'encaisse',
                'reglement' => $validated['reglement'],
                'montant_paye' => $newPaid,
                'payment_action' => $remaining <= 0.009 ? 'Payé' : 'Inst',
            ]);

            return $payment->fresh(['client', 'allocations.saleOrder']);
        });

        return response()->json([
            'message' => 'Paiement enregistré',
            'data' => [
                'order_id' => $order->id,
                'reference' => $order->reference,
                'payment_id' => $payment->id,
                'payment_reference' => $payment->reference,
            ],
        ]);
    }

    /** Ventes commercial : bons validés / encaissés (données saisies + Rég / Solde). */
    public function pendingPayment(Request $request)
    {
        $user = $request->user();

        $query = SaleOrder::with(['client', 'items', 'user.role'])
            ->where('status', '!=', 'annule')
            ->whereIn('status', ['valide', 'encaisse', 'livre', 'en_attente'])
            ->orderByDesc('order_date')
            ->orderByDesc('id');

        if ($user?->role?->slug === 'commercial') {
            $query->where('user_id', $user->id);
        }

        $orders = $query->get();
        $formatted = $orders->map(fn ($o) => $this->formatOrder($o));
        $totalSolde = $orders->sum(fn ($o) => max((float) $o->total_ttc - (float) ($o->montant_paye ?? 0), 0));

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'count' => $orders->count(),
                'total_solde' => number_format($totalSolde, 2, '.', ''),
            ],
        ]);
    }

    public function destroy(SaleOrder $sales_order)
    {
        $sales_order->delete();

        return response()->json(['message' => 'Bon de vente supprimé']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'client_id' => ($partial ? 'sometimes' : 'required').'|exists:clients,id',
            'order_date' => ($partial ? 'sometimes' : 'required').'|date',
            'bc_number' => 'nullable|string|max:50',
            'reglement' => 'nullable|in:Esp,Chq,Eff,Vir,Vers',
            'echeance' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'chauffeur' => 'nullable|string|max:255',
            'matricule' => 'nullable|string|max:50',
            'status' => 'nullable|in:en_attente,valide,annule,livre,encaisse',
            'items' => ($partial ? 'sometimes' : 'required').'|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.article_ref' => 'nullable|string|max:100',
            'items.*.code_barre' => 'nullable|string|max:100',
            'items.*.description' => 'required|string|max:255',
            'items.*.categorie' => 'nullable|string|max:255',
            'items.*.famille' => 'nullable|string|max:255',
            'items.*.marque' => 'nullable|string|max:255',
            'items.*.unit' => 'nullable|string|max:20',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'designation' => 'nullable|string|max:255',
            'article_ref' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:20',
            'unit_price' => 'nullable|numeric|min:0',
            'quantity' => 'nullable|numeric|min:0.001',
            'subtotal' => 'nullable|numeric|min:0',
        ];

        return $request->validate($rules);
    }

    private function normalizeItems(array $validated): array
    {
        if (! empty($validated['items']) && is_array($validated['items'])) {
            return collect($validated['items'])->map(function ($item) {
                $qty = (float) ($item['quantity'] ?? 1);
                $price = (float) ($item['unit_price'] ?? 0);

                return [
                    'product_id' => $item['product_id'] ?? null,
                    'article_ref' => $item['article_ref'] ?? null,
                    'code_barre' => $item['code_barre'] ?? null,
                    'description' => $item['description'] ?? 'Article',
                    'categorie' => $item['categorie'] ?? null,
                    'famille' => $item['famille'] ?? null,
                    'marque' => $item['marque'] ?? null,
                    'unit' => $item['unit'] ?? null,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'total' => round($qty * $price, 2),
                ];
            })->values()->all();
        }

        $qty = (float) ($validated['quantity'] ?? 1);
        $price = (float) ($validated['unit_price'] ?? 0);

        return [[
            'product_id' => null,
            'article_ref' => $validated['article_ref'] ?? null,
            'code_barre' => null,
            'description' => $validated['designation'] ?? 'Bon de vente',
            'categorie' => null,
            'famille' => null,
            'marque' => null,
            'unit' => $validated['unit'] ?? null,
            'quantity' => $qty,
            'unit_price' => $price,
            'total' => round($qty * $price, 2),
        ]];
    }

    private function syncItems(SaleOrder $order, array $items): void
    {
        $order->items()->delete();
        foreach ($items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'article_ref' => $item['article_ref'],
                'code_barre' => $item['code_barre'],
                'description' => $item['description'],
                'categorie' => $item['categorie'],
                'famille' => $item['famille'],
                'marque' => $item['marque'],
                'unit' => $item['unit'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'tva_rate' => 0,
                'total' => $item['total'],
            ]);
        }
    }

    private function nextReference(): string
    {
        $prefix = 'B-V'.now()->format('y').'/';
        $last = SaleOrder::where('reference', 'like', $prefix.'%')
            ->pluck('reference')
            ->map(fn ($reference) => (int) substr($reference, strrpos($reference, '/') + 1))
            ->max() ?? 0;

        return $this->referenceFor($last + 1);
    }

    private function referenceFor(int $id): string
    {
        return 'B-V'.now()->format('y').'/'.str_pad((string) $id, 4, '0', STR_PAD_LEFT);
    }

    private function formatOrder(SaleOrder $order): array
    {
        $order->loadMissing(['client', 'items', 'user.role']);

        return [
            'id' => $order->id,
            'reference' => $order->reference,
            'bc_number' => $order->bc_number,
            'order_date' => $order->order_date?->format('d/m/Y'),
            'order_date_raw' => $order->order_date?->format('Y-m-d'),
            'client_id' => $order->client_id,
            'client' => $order->client?->name,
            'commercial_name' => $order->user?->name,
            'commercial_id' => $order->user_id,
            'designation' => $order->designation,
            'article_ref' => $order->article_ref,
            'unit' => $order->unit,
            'unit_price' => number_format((float) $order->unit_price, 2, '.', ''),
            'quantity' => (float) $order->quantity,
            'subtotal' => number_format((float) $order->subtotal, 2, '.', ''),
            'montant' => number_format((float) $order->total_ttc, 2, '.', ''),
            'montant_paye' => number_format((float) ($order->montant_paye ?? 0), 2, '.', ''),
            'solde' => number_format(max((float) $order->total_ttc - (float) ($order->montant_paye ?? 0), 0), 2, '.', ''),
            'reglement' => $order->reglement ?: '—',
            'articles' => $order->items->map(fn ($i) => $i->description)->filter()->implode(', ')
                ?: ($order->designation ?: '—'),
            'echeance' => $order->echeance,
            'city' => $order->city,
            'address' => $order->address,
            'chauffeur' => $order->chauffeur,
            'matricule' => $order->matricule,
            'status' => $order->status,
            'status_label' => match ($order->status) {
                'en_attente' => 'En attente',
                'valide' => 'Attente caisse',
                'encaisse' => ((float) ($order->montant_paye ?? 0) + 0.009 >= (float) $order->total_ttc && (float) $order->total_ttc > 0)
                    ? 'Encaissé — payé'
                    : 'Encaissé — attente paiement',
                'livre' => 'Livré',
                'annule' => 'Annulé',
                default => $order->status ?: '—',
            },
            'items' => $order->items->map(fn ($i) => [
                'id' => $i->id,
                'product_id' => $i->product_id,
                'article_ref' => $i->article_ref,
                'code_barre' => $i->code_barre,
                'description' => $i->description,
                'categorie' => $i->categorie,
                'famille' => $i->famille,
                'marque' => $i->marque,
                'unit' => $i->unit,
                'quantity' => (float) $i->quantity,
                'unit_price' => number_format((float) $i->unit_price, 2, '.', ''),
                'total' => number_format((float) $i->total, 2, '.', ''),
            ])->values()->all(),
        ];
    }
}
