<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::latest()->paginate(15);

        return view('clients.index', compact('clients'));
    }

    public function create()
    {
        return view('clients.create');
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
            'status' => 'required|in:actif,inactif',
            'notes' => 'nullable|string',
        ]);

        Client::create($validated);

        return redirect()->route('clients.index')->with('success', 'Client créé avec succès.');
    }

    public function show(Client $client)
    {
        $client->load(['chantiers', 'invoices']);

        return view('clients.show', compact('client'));
    }

    public function edit(Client $client)
    {
        return view('clients.edit', compact('client'));
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'ice' => 'nullable|string|max:50',
            'status' => 'required|in:actif,inactif',
            'notes' => 'nullable|string',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')->with('success', 'Client mis à jour.');
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('clients.index')->with('success', 'Client supprimé.');
    }
}
