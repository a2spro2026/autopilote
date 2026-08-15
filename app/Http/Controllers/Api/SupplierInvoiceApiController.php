<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupplierInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierInvoiceApiController extends Controller
{
    private const DEPOTS = ['depot_a', 'depot_b'];

    private const STATUTS = ['brouillon', 'en_attente', 'partielle', 'payee', 'en_retard', 'annulee'];

    public function index(Request $request)
    {
        $query = SupplierInvoice::with(['supplier', 'items'])
            ->when($request->depot, fn ($q, $d) => $q->where('depot', $d))
            ->latest('invoice_date')
            ->latest('id');

        $invoices = $query->get();

        $totalsQuery = SupplierInvoice::query()->when($request->depot, fn ($q, $d) => $q->where('depot', $d));

        return response()->json([
            'data' => $invoices->map(fn ($i) => $this->format($i))->values()->all(),
            'meta' => [
                'total_ht' => number_format((float) (clone $totalsQuery)->sum('total_ht'), 2, '.', ''),
                'total_ttc' => number_format((float) (clone $totalsQuery)->sum('total_ttc'), 2, '.', ''),
                'count' => $invoices->count(),
            ],
        ]);
    }

    public function meta()
    {
        return response()->json([
            'next_ref' => $this->nextReference(),
            'date' => now()->format('d/m/Y'),
            'date_raw' => now()->format('Y-m-d'),
            'depots' => [
                ['value' => 'depot_a', 'label' => 'Depot A'],
                ['value' => 'depot_b', 'label' => 'Depot B'],
            ],
            'statuts' => self::STATUTS,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $invoice = DB::transaction(function () use ($validated) {
            $totalHt = round(collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_price']), 2);
            $tva = round($totalHt * 0.20, 2);

            $invoice = SupplierInvoice::create([
                'supplier_id' => $validated['supplier_id'],
                'chantier_id' => $validated['chantier_id'] ?? null,
                'depot' => $validated['depot'],
                'reference' => $this->nextReference(),
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'total_ht' => $totalHt,
                'tva' => $tva,
                'total_ttc' => round($totalHt + $tva, 2),
                'status' => $validated['status'] ?? 'en_attente',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => round($item['quantity'] * $item['unit_price'], 2),
                ]);
            }

            return $invoice->fresh(['supplier', 'items']);
        });

        return response()->json(['data' => $this->format($invoice)], 201);
    }

    public function show(SupplierInvoice $supplier_invoice)
    {
        return response()->json(['data' => $this->format($supplier_invoice->load(['supplier', 'items']))]);
    }

    public function update(Request $request, SupplierInvoice $supplier_invoice)
    {
        $validated = $this->validated($request, $supplier_invoice->id);

        $invoice = DB::transaction(function () use ($validated, $supplier_invoice) {
            $totalHt = round(collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_price']), 2);
            $tva = round($totalHt * 0.20, 2);

            $supplier_invoice->update([
                'supplier_id' => $validated['supplier_id'],
                'chantier_id' => $validated['chantier_id'] ?? null,
                'depot' => $validated['depot'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'total_ht' => $totalHt,
                'tva' => $tva,
                'total_ttc' => round($totalHt + $tva, 2),
                'status' => $validated['status'] ?? 'en_attente',
                'notes' => $validated['notes'] ?? null,
            ]);

            $supplier_invoice->items()->delete();
            foreach ($validated['items'] as $item) {
                $supplier_invoice->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => round($item['quantity'] * $item['unit_price'], 2),
                ]);
            }

            return $supplier_invoice->fresh(['supplier', 'items']);
        });

        return response()->json(['data' => $this->format($invoice)]);
    }

    public function destroy(SupplierInvoice $supplier_invoice)
    {
        $supplier_invoice->delete();

        return response()->json(['message' => 'Facture supprimée']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $refRule = 'required|string|max:50|unique:supplier_invoices,reference';
        if ($ignoreId) {
            $refRule .= ','.$ignoreId;
        }

        return $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'depot' => 'required|in:'.implode(',', self::DEPOTS),
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'status' => 'nullable|in:'.implode(',', self::STATUTS),
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);
    }

    private function nextReference(): string
    {
        $last = SupplierInvoice::query()->orderByDesc('id')->value('id') ?? 0;

        return 'FA-'.str_pad((string) ($last + 1), 4, '0', STR_PAD_LEFT);
    }

    private function format(SupplierInvoice $i): array
    {
        return [
            'id' => $i->id,
            'reference' => $i->reference,
            'invoice_date' => $i->invoice_date?->format('d/m/Y'),
            'invoice_date_raw' => $i->invoice_date?->format('Y-m-d'),
            'due_date' => $i->due_date?->format('d/m/Y'),
            'due_date_raw' => $i->due_date?->format('Y-m-d'),
            'supplier_id' => $i->supplier_id,
            'fournisseur' => $i->supplier?->name ?? '—',
            'depot' => $i->depot,
            'depot_label' => $this->depotLabel($i->depot),
            'total_ht' => round((float) $i->total_ht, 2),
            'tva' => round((float) $i->tva, 2),
            'total_ttc' => round((float) $i->total_ttc, 2),
            'amount_paid' => round((float) $i->amount_paid, 2),
            'solde' => round((float) $i->total_ttc - (float) $i->amount_paid, 2),
            'status' => $i->status,
            'notes' => $i->notes,
            'items' => $i->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'description' => $item->description,
                'quantity' => (float) $item->quantity,
                'unit_price' => round((float) $item->unit_price, 2),
                'total' => round((float) $item->total, 2),
            ])->values()->all(),
        ];
    }

    private function depotLabel(?string $depot): string
    {
        return match ($depot) {
            'depot_b' => 'Depot B',
            default => 'Depot A',
        };
    }
}
