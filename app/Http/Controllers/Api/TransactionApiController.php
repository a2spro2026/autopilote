<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonetaryTransaction;
use Illuminate\Http\Request;

class TransactionApiController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->filteredQuery($request)->latest('transaction_date')->latest('id');

        if ($request->boolean('all')) {
            $rows = $query->get();

            return response()->json([
                'data' => $rows->map(fn ($t) => $this->format($t)),
                'summary' => $this->summary($rows),
                'meta' => ['date' => now()->format('d/m/Y')],
            ]);
        }

        return response()->json($query->paginate(20)->through(fn ($t) => $this->format($t)));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $transaction = MonetaryTransaction::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->format($transaction), 201);
    }

    public function show(MonetaryTransaction $monetary_transaction)
    {
        return response()->json($this->format($monetary_transaction));
    }

    public function update(Request $request, MonetaryTransaction $monetary_transaction)
    {
        $monetary_transaction->update($this->validated($request));

        return response()->json($this->format($monetary_transaction->fresh()));
    }

    public function destroy(MonetaryTransaction $monetary_transaction)
    {
        $monetary_transaction->delete();

        return response()->json(['message' => 'Transaction supprimée']);
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'coffre' => 'required|in:Caisse,Cmpt Pers,Cmpt Ste',
            'statut' => 'required|in:Sortie,Entrée,Débit,Crédit',
            'type_reglement' => 'nullable|in:Esp,Chq,Eff,Vir,Vers',
            'amount' => 'required|numeric|min:0.01',
            'beneficiary' => 'required|string|max:255',
            'motif' => 'nullable|string|max:1000',
        ]);

        $validated['statut'] = $this->normalizeStatut($validated['statut']);

        return $validated;
    }

    private function filteredQuery(Request $request)
    {
        return MonetaryTransaction::query()
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('transaction_date', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('transaction_date', '<=', $d))
            ->when($request->statut, fn ($q, $s) => $q->whereIn('statut', $this->statutAliases($s)))
            ->when($request->coffre, fn ($q, $c) => $q->where('coffre', $c));
    }

    private function summary($rows): array
    {
        $totalDebit = round((float) $rows->filter(fn ($r) => $this->isSortie($r->statut))->sum('amount'), 2);
        $totalEntree = round((float) $rows->filter(fn ($r) => $this->isEntree($r->statut))->sum('amount'), 2);

        return [
            'total_debit' => $totalDebit,
            'total_caisse' => $this->coffreBalance($rows, 'Caisse'),
            'total_cmpt_pers' => $this->coffreBalance($rows, 'Cmpt Pers'),
            'total_cmpt_ste' => $this->coffreBalance($rows, 'Cmpt Ste'),
            'solde' => round($totalEntree - $totalDebit, 2),
        ];
    }

    private function coffreBalance($rows, string $coffre): float
    {
        $subset = $rows->where('coffre', $coffre);
        $entrees = (float) $subset->filter(fn ($r) => $this->isEntree($r->statut))->sum('amount');
        $sorties = (float) $subset->filter(fn ($r) => $this->isSortie($r->statut))->sum('amount');

        return round($entrees - $sorties, 2);
    }

    private function isSortie(?string $statut): bool
    {
        return in_array($statut, ['Débit', 'Sortie'], true);
    }

    private function isEntree(?string $statut): bool
    {
        return in_array($statut, ['Crédit', 'Entrée'], true);
    }

    private function normalizeStatut(string $statut): string
    {
        return match ($statut) {
            'Débit' => 'Sortie',
            'Crédit' => 'Entrée',
            default => $statut,
        };
    }

    private function statutAliases(string $statut): array
    {
        return match ($this->normalizeStatut($statut)) {
            'Sortie' => ['Sortie', 'Débit'],
            'Entrée' => ['Entrée', 'Crédit'],
            default => [$statut],
        };
    }

    private function format(MonetaryTransaction $t): array
    {
        return [
            'id' => $t->id,
            'transaction_date' => $t->transaction_date?->format('d/m/Y'),
            'transaction_date_raw' => $t->transaction_date?->format('Y-m-d'),
            'coffre' => $t->coffre,
            'statut' => $this->normalizeStatut($t->statut),
            'type_reglement' => $t->type_reglement,
            'amount' => round((float) $t->amount, 2),
            'beneficiary' => $t->beneficiary,
            'motif' => $t->motif,
            'created_at' => $t->created_at?->format('d/m/Y H:i'),
        ];
    }
}
