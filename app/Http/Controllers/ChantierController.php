<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Client;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;

class ChantierController extends Controller
{
    public function index()
    {
        $chantiers = Chantier::with(['client', 'manager'])->latest()->paginate(15);

        return view('chantiers.index', compact('chantiers'));
    }

    public function create()
    {
        $clients = Client::where('status', 'actif')->orderBy('name')->get();
        $managers = User::where('is_active', true)->orderBy('name')->get();

        return view('chantiers.create', compact('clients', 'managers'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'reference' => 'required|string|max:50|unique:chantiers',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'required|numeric|min:0',
            'status' => 'required|in:planifie,en_cours,suspendu,termine,annule',
            'progress' => 'required|integer|min:0|max:100',
            'manager_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        Chantier::create($validated);

        return redirect()->route('chantiers.index')->with('success', 'Chantier créé avec succès.');
    }

    public function show(Chantier $chantier)
    {
        $chantier->load(['client', 'manager', 'besoins.product', 'assignments.employee']);
        $employees = Employee::where('status', 'actif')->orderBy('last_name')->get();

        return view('chantiers.show', compact('chantier', 'employees'));
    }

    public function edit(Chantier $chantier)
    {
        $clients = Client::where('status', 'actif')->orderBy('name')->get();
        $managers = User::where('is_active', true)->orderBy('name')->get();

        return view('chantiers.edit', compact('chantier', 'clients', 'managers'));
    }

    public function update(Request $request, Chantier $chantier)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'reference' => 'required|string|max:50|unique:chantiers,reference,'.$chantier->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'required|numeric|min:0',
            'status' => 'required|in:planifie,en_cours,suspendu,termine,annule',
            'progress' => 'required|integer|min:0|max:100',
            'manager_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        $chantier->update($validated);

        return redirect()->route('chantiers.index')->with('success', 'Chantier mis à jour.');
    }

    public function destroy(Chantier $chantier)
    {
        $chantier->delete();

        return redirect()->route('chantiers.index')->with('success', 'Chantier supprimé.');
    }
}
