<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::latest()->paginate(15);

        return view('suppliers.index', compact('suppliers'));
    }

    public function create()
    {
        return view('suppliers.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'ice' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:100',
            'status' => 'required|in:actif,inactif',
            'notes' => 'nullable|string',
        ]);

        Supplier::create($validated);

        return redirect()->route('suppliers.index')->with('success', 'Fournisseur créé avec succès.');
    }

    public function show(Supplier $supplier)
    {
        $supplier->load('invoices');

        return view('suppliers.show', compact('supplier'));
    }

    public function edit(Supplier $supplier)
    {
        return view('suppliers.edit', compact('supplier'));
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'ice' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:100',
            'status' => 'required|in:actif,inactif',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')->with('success', 'Fournisseur mis à jour.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Fournisseur supprimé.');
    }
}
