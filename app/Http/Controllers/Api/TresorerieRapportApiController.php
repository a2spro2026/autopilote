<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientPayment;
use App\Models\SupplierPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TresorerieRapportApiController extends Controller
{
    public function index(Request $request)
    {
        $mois = $request->filled('mois') ? (string) $request->mois : null;
        $operation = $request->filled('operation') ? (string) $request->operation : null;
        $type = $request->filled('type') ? (string) $request->type : null;

        $rows = $this->collectRows($mois, $type)
            ->when($operation, fn (Collection $c) => $c->where('operation', $operation)->values())
            ->sortByDesc(fn ($r) => $r['date_raw'].'-'.$r['id'])
            ->values();

        $totalDebit = round((float) $rows->sum('debit'), 2);
        $totalCredit = round((float) $rows->sum('credit'), 2);

        return response()->json([
            'data' => $rows->all(),
            'meta' => [
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'total_solde' => round($totalCredit - $totalDebit, 2),
                'date' => now()->format('d/m/Y'),
            ],
        ]);
    }

    /**
     * Débit  = règlements fournisseur statut Payé
     * Crédit = règlements client statut Payé (encaissés / payés)
     * Caisse = règlements client en Espèces (Esp)
     */
    private function collectRows(?string $mois, ?string $type): Collection
    {
        $rows = collect();
        $includeDebit = $type === null || $type === '' || $type === 'Débit';
        $includeCredit = $type === null || $type === '' || $type === 'Crédit';
        $includeCaisseOnly = $type === 'Caisse';

        if ($includeDebit) {
            $supplierQuery = SupplierPayment::query()
                ->where('statut', 'Payé')
                ->latest('payment_date')
                ->latest('id');
            $this->applyMonth($supplierQuery, 'payment_date', $mois);

            foreach ($supplierQuery->get() as $payment) {
                $amount = round((float) $payment->montant, 2);
                $rows->push([
                    'id' => 'achat-'.$payment->id,
                    'date' => $payment->payment_date?->format('d/m/Y'),
                    'date_raw' => $payment->payment_date?->format('Y-m-d') ?? '',
                    'operation' => 'Achat',
                    'debit' => $amount,
                    'credit' => 0,
                    'caisse' => null,
                    'date_decaiss' => $payment->date_decaissement?->format('d/m/Y'),
                    'date_encaiss' => null,
                ]);
            }
        }

        if ($includeCredit) {
            $clientQuery = ClientPayment::query()
                ->where('statut', 'Payé')
                ->latest('payment_date')
                ->latest('id');
            $this->applyMonth($clientQuery, 'payment_date', $mois);

            foreach ($clientQuery->get() as $payment) {
                $amount = round((float) $payment->montant, 2);
                $isEsp = $this->isEsp($payment->reglement);
                $rows->push([
                    'id' => 'vente-'.$payment->id,
                    'date' => $payment->payment_date?->format('d/m/Y'),
                    'date_raw' => $payment->payment_date?->format('Y-m-d') ?? '',
                    'operation' => 'Vente',
                    'debit' => 0,
                    'credit' => $amount,
                    'caisse' => $isEsp ? $amount : null,
                    'date_decaiss' => null,
                    'date_encaiss' => $payment->date_decaissement?->format('d/m/Y'),
                ]);
            }
        }

        if ($includeCaisseOnly) {
            $espQuery = ClientPayment::query()
                ->where('reglement', 'Esp')
                ->latest('payment_date')
                ->latest('id');
            $this->applyMonth($espQuery, 'payment_date', $mois);

            foreach ($espQuery->get() as $payment) {
                $amount = round((float) $payment->montant, 2);
                $isPaye = ($payment->statut ?: 'Inst') === 'Payé';
                $rows->push([
                    'id' => 'esp-'.$payment->id,
                    'date' => $payment->payment_date?->format('d/m/Y'),
                    'date_raw' => $payment->payment_date?->format('Y-m-d') ?? '',
                    'operation' => 'Vente',
                    'debit' => 0,
                    'credit' => $isPaye ? $amount : 0,
                    'caisse' => $amount,
                    'date_decaiss' => null,
                    'date_encaiss' => $payment->date_decaissement?->format('d/m/Y'),
                ]);
            }
        }

        return $rows;
    }

    private function isEsp(?string $reglement): bool
    {
        return strcasecmp((string) $reglement, 'Esp') === 0;
    }

    private function applyMonth($query, string $column, ?string $mois): void
    {
        if (! $mois || ! preg_match('/^\d{4}-\d{2}$/', $mois)) {
            return;
        }

        try {
            $start = Carbon::createFromFormat('Y-m', $mois)->startOfMonth();
        } catch (\Throwable) {
            return;
        }

        $query->whereDate($column, '>=', $start->toDateString())
            ->whereDate($column, '<=', $start->copy()->endOfMonth()->toDateString());
    }
}
