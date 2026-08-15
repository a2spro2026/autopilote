<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientOrder;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuoteApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Quote::with(['client', 'items'])
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('quote_date', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('quote_date', '<=', $d))
            ->when($request->client_name, fn ($q, $n) => $q->whereHas('client', fn ($c) => $c->where('name', 'like', "%{$n}%")))
            ->when($request->city, fn ($q, $c) => $q->where('city', 'like', "%{$c}%"))
            ->when($request->statut === 'valide', fn ($q) => $q->where('status', 'accepte'))
            ->when($request->statut === 'en_attente', fn ($q) => $q->whereIn('status', ['brouillon', 'envoye']))
            ->latest('quote_date');

        if ($request->boolean('all')) {
            return response()->json([
                'data' => $query->get()->map(fn ($q) => $this->formatQuote($q)),
                'meta' => [
                    'next_ref' => $this->nextReference(),
                    'date' => now()->format('d/m/Y'),
                ],
            ]);
        }

        return response()->json($query->paginate(15)->through(fn ($q) => $this->formatQuote($q)));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated['work_delay'] = $this->formatWorkDelay($validated['work_delay'] ?? null);

        $quote = DB::transaction(function () use ($validated) {
            $subtotal = $this->syncQuoteItemsData($validated['items']);
            $totals = $this->totalsFromHt($subtotal);

            $quote = Quote::create([
                'client_id' => $validated['client_id'],
                'quote_date' => $validated['quote_date'] ?? now()->toDateString(),
                'contact' => $validated['contact'] ?? null,
                'city' => $validated['city'] ?? null,
                'chantier_type' => $validated['chantier_type'] ?? null,
                'budget' => $validated['budget'] ?? 0,
                'work_delay' => $validated['work_delay'] ?? null,
                'reference' => 'DV-PENDING',
                'status' => 'brouillon',
                ...$totals,
                ...$this->legacyFieldsFromItems($validated['items']),
            ]);

            $quote->update(['reference' => $this->referenceFor($quote->id)]);
            $this->persistQuoteItems($quote, $validated['items']);

            return $quote;
        });

        return response()->json($this->formatQuote($quote->fresh(['client', 'items'])), 201);
    }

    public function show(Quote $quote)
    {
        return response()->json($this->formatQuote($quote->load(['client', 'clientOrder', 'items'])));
    }

    public function update(Request $request, Quote $quote)
    {
        if ($quote->status === 'accepte') {
            return response()->json(['message' => 'Un devis validé ne peut plus être modifié'], 422);
        }

        $validated = $this->validated($request, true);
        if (array_key_exists('work_delay', $validated)) {
            $validated['work_delay'] = $this->formatWorkDelay($validated['work_delay']);
        }

        $subtotal = $this->syncQuoteItemsData($validated['items']);
        $totals = $this->totalsFromHt($subtotal);
        $legacy = $this->legacyFieldsFromItems($validated['items']);

        $quote->update([
            'client_id' => $validated['client_id'],
            'quote_date' => $validated['quote_date'],
            'contact' => $validated['contact'] ?? null,
            'city' => $validated['city'] ?? null,
            'chantier_type' => $validated['chantier_type'] ?? null,
            'budget' => $validated['budget'] ?? 0,
            'work_delay' => $validated['work_delay'] ?? null,
            ...$totals,
            ...$legacy,
        ]);

        $this->persistQuoteItems($quote, $validated['items']);

        return response()->json($this->formatQuote($quote->fresh(['client', 'items'])));
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();

        return response()->json(['message' => 'Devis supprimé']);
    }

    public function send(Quote $quote)
    {
        if ($quote->status === 'accepte') {
            return response()->json(['message' => 'Ce devis est déjà validé'], 422);
        }

        $quote->update([
            'status' => 'envoye',
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Devis envoyé au client pour validation',
            'data' => $this->formatQuote($quote->fresh(['client', 'items'])),
        ]);
    }

    public function validateQuote(Quote $quote, Request $request)
    {
        if ($quote->status === 'accepte') {
            return response()->json(['message' => 'Ce devis est déjà validé'], 422);
        }

        $quote->load('items');

        $order = DB::transaction(function () use ($quote, $request) {
            $order = ClientOrder::create([
                'reference' => 'BDC-PENDING',
                'quote_id' => $quote->id,
                'client_id' => $quote->client_id,
                'order_date' => now()->toDateString(),
                'contact' => $quote->contact,
                'city' => $quote->city,
                'chantier_type' => $quote->chantier_type,
                'budget' => $quote->budget,
                'work_delay' => $quote->work_delay,
                'type_travaux' => $quote->type_travaux,
                'designation' => $quote->designation,
                'consistance' => $quote->consistance,
                'unit' => $quote->unit,
                'quantity' => $quote->quantity,
                'unit_price' => $quote->unit_price,
                'subtotal' => $quote->subtotal,
                'total_ht' => $quote->total_ht,
                'tva' => $quote->tva,
                'total_ttc' => $quote->total_ttc,
                'status' => 'en_attente',
                'user_id' => $request->user()->id,
            ]);

            $order->update(['reference' => $this->orderReferenceFor($order->id)]);

            foreach ($quote->items as $item) {
                $order->items()->create([
                    'type_travaux' => $item->type_travaux,
                    'description' => $item->description,
                    'consistance' => $item->consistance,
                    'unit' => $item->unit,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                ]);
            }

            $quote->update([
                'status' => 'accepte',
                'client_order_id' => $order->id,
            ]);

            return $order;
        });

        return response()->json([
            'message' => 'Devis validé — Bon de commande '.$order->reference.' créé',
            'data' => $this->formatQuote($quote->fresh(['client', 'clientOrder', 'items'])),
            'bon_commande' => $order->reference,
        ]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'client_id' => ($partial ? 'sometimes' : 'required').'|exists:clients,id',
            'quote_date' => ($partial ? 'sometimes' : 'required').'|date',
            'contact' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'chantier_type' => 'nullable|in:Public,Privé',
            'budget' => 'nullable|numeric|min:0',
            'work_delay' => 'nullable|string|max:100',
            'items' => ($partial ? 'sometimes' : 'required').'|array|min:1',
            'items.*.type_travaux' => 'nullable|string|max:100',
            'items.*.designation' => 'required|string|max:500',
            'items.*.consistance' => 'nullable|in:F,M,F+M',
            'items.*.unit' => 'nullable|string|max:20',
            'items.*.quantity' => 'nullable|numeric|min:0.001',
            'items.*.unit_price' => 'nullable|numeric|min:0',
        ]);
    }

    private function syncQuoteItemsData(array $items): float
    {
        $total = 0;

        foreach ($items as $row) {
            $qty = (float) ($row['quantity'] ?? 1);
            $price = (float) ($row['unit_price'] ?? 0);
            $total += round($qty * $price, 2);
        }

        return round($total, 2);
    }

    private function persistQuoteItems(Quote $quote, array $items): void
    {
        $quote->items()->delete();

        foreach ($items as $row) {
            $qty = (float) ($row['quantity'] ?? 1);
            $price = (float) ($row['unit_price'] ?? 0);
            $lineTotal = round($qty * $price, 2);

            $quote->items()->create([
                'type_travaux' => $row['type_travaux'] ?? null,
                'description' => $row['designation'],
                'consistance' => $row['consistance'] ?? null,
                'unit' => $row['unit'] ?? null,
                'quantity' => $qty,
                'unit_price' => $price,
                'total' => $lineTotal,
            ]);
        }
    }

    private function totalsFromHt(float $totalHt): array
    {
        $ht = round($totalHt, 2);
        $tva = round($ht * 0.20, 2);

        return [
            'subtotal' => $ht,
            'total_ht' => $ht,
            'tva' => $tva,
            'total_ttc' => round($ht + $tva, 2),
        ];
    }

    private function legacyFieldsFromItems(array $items): array
    {
        $first = $items[0] ?? [];
        $qty = (float) ($first['quantity'] ?? 1);
        $price = (float) ($first['unit_price'] ?? 0);

        return [
            'type_travaux' => $first['type_travaux'] ?? null,
            'designation' => $first['designation'] ?? null,
            'consistance' => $first['consistance'] ?? null,
            'unit' => $first['unit'] ?? null,
            'quantity' => $qty,
            'unit_price' => $price,
        ];
    }

    private function nextReference(): string
    {
        return $this->referenceFor((Quote::max('id') ?? 0) + 1);
    }

    private function referenceFor(int $id): string
    {
        return 'DV-'.str_pad((string) $id, 4, '0', STR_PAD_LEFT);
    }

    private function orderReferenceFor(int $id): string
    {
        return 'BDC-'.str_pad((string) $id, 4, '0', STR_PAD_LEFT);
    }

    private function formatQuote(Quote $quote): array
    {
        $quote->loadMissing('client', 'clientOrder', 'items');

        $items = $quote->items->map(fn ($item) => [
            'id' => $item->id,
            'type_travaux' => $item->type_travaux,
            'designation' => $item->description,
            'consistance' => $item->consistance,
            'unit' => $item->unit,
            'quantity' => (float) $item->quantity,
            'unit_price' => round((float) $item->unit_price, 2),
            'subtotal' => round((float) $item->total, 2),
        ])->values()->all();

        if (count($items) === 0 && $quote->designation) {
            $items = [[
                'id' => null,
                'type_travaux' => $quote->type_travaux ?? null,
                'designation' => $quote->designation,
                'consistance' => $quote->consistance,
                'unit' => $quote->unit,
                'quantity' => (float) $quote->quantity,
                'unit_price' => round((float) $quote->unit_price, 2),
                'subtotal' => round((float) $quote->subtotal, 2),
            ]];
        }

        $designationSummary = $this->designationSummary($items);
        $ht = round((float) $quote->subtotal, 2);
        $amounts = ((float) $quote->tva) > 0
            ? ['tva' => round((float) $quote->tva, 2), 'total_ttc' => round((float) $quote->total_ttc, 2)]
            : $this->totalsFromHt($ht);

        return [
            'id' => $quote->id,
            'reference' => $quote->reference,
            'quote_date' => $quote->quote_date?->format('d/m/Y'),
            'quote_date_raw' => $quote->quote_date?->format('Y-m-d'),
            'client_id' => $quote->client_id,
            'client_name' => $quote->client?->name,
            'contact' => $quote->contact,
            'city' => $quote->city,
            'chantier_type' => $quote->chantier_type,
            'budget' => round((float) $quote->budget, 2),
            'work_delay' => $quote->work_delay,
            'items' => $items,
            'items_count' => count($items),
            'type_travaux' => $items[0]['type_travaux'] ?? ($quote->type_travaux ?? null),
            'designation' => $designationSummary,
            'consistance' => $items[0]['consistance'] ?? $quote->consistance,
            'unit' => $items[0]['unit'] ?? $quote->unit,
            'quantity' => $items[0]['quantity'] ?? (float) $quote->quantity,
            'unit_price' => $items[0]['unit_price'] ?? round((float) $quote->unit_price, 2),
            'subtotal' => $ht,
            'total_ht' => $ht,
            'tva' => $amounts['tva'],
            'total_ttc' => $amounts['total_ttc'],
            'montant' => $amounts['total_ttc'],
            'status' => $quote->status,
            'statut' => $quote->statutLabel(),
            'sent_at' => $quote->sent_at?->format('d/m/Y H:i'),
            'bon_commande' => $quote->clientOrder?->reference,
            'created_at' => $quote->created_at?->format('d/m/Y'),
        ];
    }

    private function designationSummary(array $items): string
    {
        if (count($items) === 0) {
            return '—';
        }

        if (count($items) === 1) {
            return $items[0]['designation'] ?: '—';
        }

        $first = $items[0]['designation'] ?: 'Produit';

        return $first.' (+'.(count($items) - 1).' ligne'.(count($items) > 2 ? 's' : '').')';
    }

    private function formatWorkDelay(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $n = trim(preg_replace('/\s*Jrs?\.?$/i', '', $value));

        return $n !== '' ? $n.' Jrs' : null;
    }
}
