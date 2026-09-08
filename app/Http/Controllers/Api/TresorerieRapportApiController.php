<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientPayment;
use App\Models\MonetaryTransaction;
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

        $rows = $this->collectRows($mois)
            ->when($operation, fn (Collection $c) => $c->where('operation', $operation)->values())
            ->when($type, fn (Collection $c) => $this->filterByType($c, $type)->values())
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

    private function collectRows(?string $mois): Collection
    {
        $rows = collect();

        $supplierQuery = SupplierPayment::query()->latest('payment_date')->latest('id');
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

        $clientQuery = ClientPayment::query()->latest('payment_date')->latest('id');
        $this->applyMonth($clientQuery, 'payment_date', $mois);
        foreach ($clientQuery->get() as $payment) {
            $amount = round((float) $payment->montant, 2);
            $caisse = $payment->tresorerie;
            $rows->push([
                'id' => 'vente-'.$payment->id,
                'date' => $payment->payment_date?->format('d/m/Y'),
                'date_raw' => $payment->payment_date?->format('Y-m-d') ?? '',
                'operation' => 'Vente',
                'debit' => 0,
                'credit' => $amount,
                'caisse' => $caisse !== null && $caisse !== '' ? (string) $caisse : null,
                'date_decaiss' => null,
                'date_encaiss' => $payment->date_decaissement?->format('d/m/Y'),
            ]);
        }

        $txQuery = MonetaryTransaction::query()
            ->where('coffre', 'Caisse')
            ->latest('transaction_date')
            ->latest('id');
        $this->applyMonth($txQuery, 'transaction_date', $mois);
        foreach ($txQuery->get() as $tx) {
            $amount = round((float) $tx->amount, 2);
            $isDebit = in_array($tx->statut, ['Débit', 'Sortie'], true);
            $rows->push([
                'id' => 'caisse-'.$tx->id,
                'date' => $tx->transaction_date?->format('d/m/Y'),
                'date_raw' => $tx->transaction_date?->format('Y-m-d') ?? '',
                'operation' => $isDebit ? 'Achat' : 'Vente',
                'debit' => $isDebit ? $amount : 0,
                'credit' => $isDebit ? 0 : $amount,
                'caisse' => 'Caisse',
                'date_decaiss' => $isDebit ? $tx->transaction_date?->format('d/m/Y') : null,
                'date_encaiss' => $isDebit ? null : $tx->transaction_date?->format('d/m/Y'),
            ]);
        }

        return $rows;
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

    private function filterByType(Collection $rows, string $type): Collection
    {
        return match ($type) {
            'Débit' => $rows->filter(fn ($r) => (float) $r['debit'] > 0),
            'Crédit' => $rows->filter(fn ($r) => (float) $r['credit'] > 0),
            'Caisse' => $rows->filter(fn ($r) => ! empty($r['caisse'])),
            default => $rows,
        };
    }
}
