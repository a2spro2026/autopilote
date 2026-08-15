<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientInvoice;
use App\Models\Chantier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientInvoiceController extends Controller
{
    public function index()
    {
        $invoices = ClientInvoice::with(['client', 'chantier'])->latest('invoice_date')->paginate(15);

        return view('client-invoices.index', compact('invoices'));
    }

    public function create()
    {
        $clients = Client::where('status', 'actif')->orderBy('name')->get();
        $chantiers = Chantier::whereIn('status', ['planifie', 'en_cours'])->orderBy('name')->get();

        return view('client-invoices.create', compact('clients', 'chantiers'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'reference' => 'required|string|max:50|unique:client_invoices',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'status' => 'required|in:brouillon,en_attente,partielle,payee,en_retard,annulee',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $totalHt = collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $tva = $totalHt * 0.20;

            $invoice = ClientInvoice::create([
                'client_id' => $validated['client_id'],
                'chantier_id' => $validated['chantier_id'] ?? null,
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
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('client-invoices.index')->with('success', 'Facture client créée.');
    }

    public function show(ClientInvoice $clientInvoice)
    {
        $clientInvoice->load(['client', 'chantier', 'items', 'payments']);

        return view('client-invoices.show', compact('clientInvoice'));
    }

    public function edit(ClientInvoice $clientInvoice)
    {
        $clients = Client::where('status', 'actif')->orderBy('name')->get();
        $chantiers = Chantier::orderBy('name')->get();
        $clientInvoice->load('items');

        return view('client-invoices.edit', compact('clientInvoice', 'clients', 'chantiers'));
    }

    public function update(Request $request, ClientInvoice $clientInvoice)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'reference' => 'required|string|max:50|unique:client_invoices,reference,'.$clientInvoice->id,
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'status' => 'required|in:brouillon,en_attente,partielle,payee,en_retard,annulee',
            'notes' => 'nullable|string',
        ]);

        $clientInvoice->update($validated);

        return redirect()->route('client-invoices.index')->with('success', 'Facture mise à jour.');
    }

    public function destroy(ClientInvoice $clientInvoice)
    {
        $clientInvoice->delete();

        return redirect()->route('client-invoices.index')->with('success', 'Facture supprimée.');
    }
}
