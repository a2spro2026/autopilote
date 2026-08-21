<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;

class SupplierReleveApiController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;
        $supplierId = $request->supplier_id;
        $clientLivre = trim((string) $request->client_livre);

        $orders = PurchaseOrder::query()
            ->with(['supplier', 'items'])
            ->where('status', '!=', 'annule')
            ->when($supplierId, fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($dateFrom, fn ($q, $d) => $q->whereDate('order_date', '>=', $d))
            ->when($dateTo, fn ($q, $d) => $q->whereDate('order_date', '<=', $d))
            ->when($clientLivre !== '', function ($q) use ($clientLivre) {
                $q->where('client_livre', 'like', '%'.$clientLivre.'%');
            })
            ->orderBy('order_date')
            ->orderBy('id')
            ->get();

        $payments = SupplierPayment::query()
            ->with(['supplier', 'allocations.purchaseOrder'])
            ->when($supplierId, fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($dateFrom, fn ($q, $d) => $q->whereDate('payment_date', '>=', $d))
            ->when($dateTo, fn ($q, $d) => $q->whereDate('payment_date', '<=', $d))
            ->when($clientLivre !== '', function ($q) use ($clientLivre) {
                $q->whereHas('allocations.purchaseOrder', function ($oq) use ($clientLivre) {
                    $oq->where('client_livre', 'like', '%'.$clientLivre.'%');
                });
            })
            ->orderBy('payment_date')
            ->orderBy('id')
            ->get();

        $events = collect();

        foreach ($orders as $order) {
            $qty = $order->items->sum(fn ($i) => (float) $i->quantity);
            if ($qty <= 0) {
                $qty = (float) ($order->quantity ?? 0);
            }

            $events->push([
                'sort_date' => optional($order->order_date)?->format('Y-m-d') ?? '0000-00-00',
                'sort_id' => (int) $order->id,
                'sort_type' => 0,
                'operation' => 'Achat',
                'date' => $order->order_date?->format('d/m/Y'),
                'numero_bn' => $order->reference,
                'client_livre' => $order->client_livre,
                'ville_liv' => $order->city,
                'qte' => round($qty, 3),
                'debit' => round((float) $order->total_ttc, 2),
                'credit' => 0.0,
                'type_reg' => $order->reglement,
                'numero_reg' => null,
                'nom_tire' => null,
                'date_encaiss' => null,
                'paye' => false,
                'devalide' => false,
                'impaye' => false,
                'reporte' => false,
            ]);
        }

        foreach ($payments as $payment) {
            $allocatedOrders = $payment->allocations
                ->map(fn ($a) => $a->purchaseOrder)
                ->filter();

            $client = $allocatedOrders
                ->pluck('client_livre')
                ->filter()
                ->unique()
                ->implode(', ');

            $ville = $allocatedOrders
                ->pluck('city')
                ->filter()
                ->unique()
                ->implode(', ');

            $bons = $allocatedOrders
                ->pluck('reference')
                ->filter()
                ->unique()
                ->implode(', ');

            $statut = $payment->statut ?: 'Inst';

            $events->push([
                'sort_date' => optional($payment->payment_date)?->format('Y-m-d') ?? '0000-00-00',
                'sort_id' => (int) $payment->id,
                'sort_type' => 1,
                'operation' => 'Rég',
                'date' => $payment->payment_date?->format('d/m/Y'),
                'numero_bn' => $bons !== '' ? $bons : $payment->reference,
                'client_livre' => $client !== '' ? $client : null,
                'ville_liv' => $ville !== '' ? $ville : null,
                'qte' => null,
                'debit' => 0.0,
                'credit' => round((float) $payment->montant, 2),
                'type_reg' => $payment->reglement,
                'numero_reg' => $payment->numero,
                'nom_tire' => $payment->nom_tire,
                'date_encaiss' => $payment->date_decaissement?->format('d/m/Y'),
                'paye' => $statut === 'Payé',
                'devalide' => $statut === 'Dévalidé',
                'impaye' => $statut === 'Imp',
                'reporte' => $statut === 'Report',
            ]);
        }

        $sorted = $events
            ->sortBy([
                ['sort_date', 'asc'],
                ['sort_type', 'asc'],
                ['sort_id', 'asc'],
            ])
            ->values();

        $running = 0.0;
        $rows = $sorted->map(function (array $row) use (&$running) {
            $running = round($running + $row['debit'] - $row['credit'], 2);
            unset($row['sort_date'], $row['sort_id'], $row['sort_type']);
            $row['solde'] = $running;

            return $row;
        })->all();

        $totalImp = round((float) $payments->where('statut', 'Imp')->sum('montant'), 2);
        $totalDeva = round((float) $payments->where('statut', 'Dévalidé')->sum('montant'), 2);
        $totalRepo = round((float) $payments->where('statut', 'Report')->sum('montant'), 2);
        $totalDebit = round((float) $orders->sum('total_ttc'), 2);
        $totalCredit = round((float) $payments->sum('montant'), 2);
        $totalEncaisse = round((float) $payments->where('statut', 'Payé')->sum('montant'), 2);
        $totalCoffre = round((float) $payments
            ->filter(function ($p) {
                $due = $p->date_decaissement;
                if (! $due) {
                    return false;
                }

                return $due->gt(now()->startOfDay()) && ! in_array($p->statut, ['Payé', 'Imp', 'Dévalidé'], true);
            })
            ->sum('montant'), 2);
        $totalQte = round((float) collect($rows)->sum(fn ($r) => (float) ($r['qte'] ?? 0)), 3);

        return response()->json([
            'data' => $rows,
            'meta' => [
                'total_imp' => number_format($totalImp, 2, '.', ''),
                'total_deva' => number_format($totalDeva, 2, '.', ''),
                'total_repo' => number_format($totalRepo, 2, '.', ''),
                'total_debit' => number_format($totalDebit, 2, '.', ''),
                'total_credit' => number_format($totalCredit, 2, '.', ''),
                'total_encaisse' => number_format($totalEncaisse, 2, '.', ''),
                'total_coffre' => number_format($totalCoffre, 2, '.', ''),
                'solde' => number_format($running, 2, '.', ''),
                'total_qte' => number_format($totalQte, 3, '.', ''),
            ],
        ]);
    }
}
