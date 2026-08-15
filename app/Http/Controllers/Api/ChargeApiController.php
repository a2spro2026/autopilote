<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Charge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChargeApiController extends Controller
{
    private const TYPES = ['Esp', 'Chq', 'Eff', 'Vir', 'Vers'];

    public function index()
    {
        $charges = Charge::query()->latest('charge_date')->latest('id')->get();

        $totalCharge = round((float) Charge::sum('montant'), 2);
        $soldeCharge = round((float) Charge::query()
            ->where(function ($q) {
                $q->whereNull('date_decaissement')
                    ->orWhereDate('date_decaissement', '>=', now()->toDateString());
            })
            ->sum('montant'), 2);

        return response()->json([
            'data' => $charges->map(fn ($c) => $this->format($c))->values()->all(),
            'meta' => [
                'total_charge' => number_format($totalCharge, 2, '.', ''),
                'solde_charge' => number_format($soldeCharge, 2, '.', ''),
            ],
        ]);
    }

    public function meta()
    {
        return response()->json([
            'next_ref' => $this->nextReference(),
            'date' => now()->format('d/m/Y'),
            'date_raw' => now()->format('Y-m-d'),
            'types' => self::TYPES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $charge = DB::transaction(function () use ($validated, $request) {
            $ref = $this->nextReference();

            return Charge::create([
                ...$validated,
                'reference' => $ref,
                'user_id' => $request->user()->id,
            ]);
        });

        return response()->json(['data' => $this->format($charge)], 201);
    }

    public function show(Charge $charge)
    {
        return response()->json(['data' => $this->format($charge)]);
    }

    public function update(Request $request, Charge $charge)
    {
        $validated = $this->validated($request);
        $charge->update($validated);

        return response()->json(['data' => $this->format($charge->fresh())]);
    }

    public function destroy(Charge $charge)
    {
        $charge->delete();

        return response()->json(['message' => 'Charge supprimée']);
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'charge_date' => 'required|date',
            'designation' => 'nullable|string|max:255',
            'beneficiaire' => 'required|string|max:255',
            'type_reglement' => 'nullable|in:'.implode(',', self::TYPES),
            'numero' => 'nullable|string|max:100',
            'banque' => 'nullable|string|max:100',
            'nom_tire' => 'nullable|string|max:255',
            'montant' => 'required|numeric|min:0',
            'date_decaissement' => 'nullable|date',
            'remarque' => 'nullable|string|max:2000',
        ]);

        if (($validated['type_reglement'] ?? null) === 'Esp') {
            $validated['numero'] = null;
            $validated['banque'] = null;
            $validated['nom_tire'] = null;
        }

        return $validated;
    }

    private function nextReference(): string
    {
        $last = Charge::query()->orderByDesc('id')->value('id') ?? 0;

        return 'CH-'.str_pad((string) ($last + 1), 4, '0', STR_PAD_LEFT);
    }

    private function format(Charge $c): array
    {
        return [
            'id' => $c->id,
            'reference' => $c->reference,
            'charge_date' => $c->charge_date?->format('d/m/Y'),
            'charge_date_raw' => $c->charge_date?->format('Y-m-d'),
            'designation' => $c->designation,
            'beneficiaire' => $c->beneficiaire,
            'type_reglement' => $c->type_reglement,
            'numero' => $c->numero,
            'banque' => $c->banque,
            'nom_tire' => $c->nom_tire,
            'montant' => round((float) $c->montant, 2),
            'date_decaissement' => $c->date_decaissement?->format('d/m/Y'),
            'date_decaissement_raw' => $c->date_decaissement?->format('Y-m-d'),
            'remarque' => $c->remarque,
        ];
    }
}
