<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\ChantierBesoin;
use App\Models\Product;
use Illuminate\Http\Request;

class ChantierBesoinController extends Controller
{
    public function store(Request $request, Chantier $chantier)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'description' => 'nullable|string|max:255',
            'quantity_needed' => 'required|numeric|min:0.001',
            'needed_by' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $chantier->besoins()->create($validated);

        return back()->with('success', 'Besoin ajouté au chantier.');
    }

    public function update(Request $request, Chantier $chantier, ChantierBesoin $chantier_besoin)
    {
        $validated = $request->validate([
            'quantity_allocated' => 'required|numeric|min:0',
            'status' => 'required|in:en_attente,commande,livre,annule',
        ]);

        $chantier_besoin->update($validated);

        return back()->with('success', 'Besoin mis à jour.');
    }

    public function destroy(Chantier $chantier, ChantierBesoin $chantier_besoin)
    {
        $chantier_besoin->delete();

        return back()->with('success', 'Besoin supprimé.');
    }
}
