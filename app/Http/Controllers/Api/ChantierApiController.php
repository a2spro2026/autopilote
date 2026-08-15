<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chantier;
use Illuminate\Http\Request;

class ChantierApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Chantier::with(['client', 'manager'])
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('reference', 'like', "%{$s}%")
                    ->orWhere('city', 'like', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->boolean('archived'), fn ($q) => $q->where('archived', true), fn ($q) => $q->where('archived', false));

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'reference' => 'required|string|unique:chantiers',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget' => 'required|numeric|min:0',
            'status' => 'required|in:planifie,en_cours,suspendu,termine,annule',
            'progress' => 'integer|min:0|max:100',
            'manager_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        $chantier = Chantier::create($validated);

        return response()->json($chantier->load(['client', 'manager']), 201);
    }

    public function show(Chantier $chantier)
    {
        return response()->json($chantier->load(['client', 'manager', 'besoins', 'assignments.employee', 'tasks']));
    }

    public function update(Request $request, Chantier $chantier)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'name' => 'sometimes|string|max:255',
            'reference' => 'sometimes|string|unique:chantiers,reference,'.$chantier->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:planifie,en_cours,suspendu,termine,annule',
            'progress' => 'integer|min:0|max:100',
            'manager_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        $chantier->update($validated);

        return response()->json($chantier->load(['client', 'manager']));
    }

    public function destroy(Chantier $chantier)
    {
        $chantier->delete();

        return response()->json(['message' => 'Chantier supprimé']);
    }

    public function archive(Chantier $chantier)
    {
        $chantier->update(['archived' => true, 'status' => 'termine']);

        return response()->json($chantier);
    }
}
