<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierInvoiceController extends Controller
{
    public function index()
    {
        $invoices = SupplierInvoice::with(['supplier', 'chantier'])->latest('invoice_date')->paginate(15);

        return view('supplier-invoices.index', compact('invoices'));
    }

    public function create()
    {
        $suppliers = Supplier::where('status', 'actif')->orderBy('name')->get();
        $chantiers = Chantier::whereIn('status', ['planifie', 'en_cours'])->orderBy('name')->get();
        $products = Product::where('status', 'actif')->orderBy('name')->get();

        return view('supplier-invoices.create', compact('suppliers', 'chantiers', 'products'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'depot' => 'required|in:depot_a,depot_b',
            'reference' => 'required|string|max:50|unique:supplier_invoices',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'status' => 'required|in:brouillon,en_attente,partielle,payee,en_retard,annulee',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $totalHt = collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $tva = $totalHt * 0.20;

            $invoice = SupplierInvoice::create([
                'supplier_id' => $validated['supplier_id'],
                'chantier_id' => $validated['chantier_id'] ?? null,
                'depot' => $validated['depot'],
                'reference' => $validated['reference'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'total_ht' => $totalHt,
                'tva' => $tva,
                'total_ttc' => $totalHt + $tva,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('supplier-invoices.index')->with('success', 'Facture fournisseur créée.');
    }

    public function show(SupplierInvoice $supplierInvoice)
    {
        $supplierInvoice->load(['supplier', 'chantier', 'items.product', 'payments']);

        return view('supplier-invoices.show', compact('supplierInvoice'));
    }

    public function edit(SupplierInvoice $supplierInvoice)
    {
        $suppliers = Supplier::where('status', 'actif')->orderBy('name')->get();
        $chantiers = Chantier::orderBy('name')->get();
        $supplierInvoice->load('items');

        return view('supplier-invoices.edit', compact('supplierInvoice', 'suppliers', 'chantiers'));
    }

    public function update(Request $request, SupplierInvoice $supplierInvoice)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'depot' => 'required|in:depot_a,depot_b',
            'reference' => 'required|string|max:50|unique:supplier_invoices,reference,'.$supplierInvoice->id,
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'status' => 'required|in:brouillon,en_attente,partielle,payee,en_retard,annulee',
            'notes' => 'nullable|string',
        ]);

        $supplierInvoice->update($validated);

        return redirect()->route('supplier-invoices.index')->with('success', 'Facture mise à jour.');
    }

    public function destroy(SupplierInvoice $supplierInvoice)
    {
        $supplierInvoice->delete();

        return redirect()->route('supplier-invoices.index')->with('success', 'Facture supprimée.');
    }
}
