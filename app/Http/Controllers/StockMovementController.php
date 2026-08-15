<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index()
    {
        $movements = StockMovement::with(['product', 'chantier', 'user'])
            ->latest()
            ->paginate(20);

        return view('stock-movements.index', compact('movements'));
    }

    public function create()
    {
        $products = Product::where('status', 'actif')->orderBy('name')->get();
        $chantiers = Chantier::whereIn('status', ['planifie', 'en_cours'])->orderBy('name')->get();

        return view('stock-movements.create', compact('products', 'chantiers'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:entree,sortie',
            'quantity' => 'required|numeric|min:0.001',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

            if ($validated['type'] === 'sortie' && $product->quantity_in_stock < $validated['quantity']) {
                throw new \InvalidArgumentException('Stock insuffisant.');
            }

            StockMovement::create([
                'product_id' => $validated['product_id'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'chantier_id' => $validated['chantier_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'user_id' => auth()->id(),
            ]);

            if ($validated['type'] === 'entree') {
                $product->increment('quantity_in_stock', $validated['quantity']);
            } else {
                $product->decrement('quantity_in_stock', $validated['quantity']);
            }
        });

        return redirect()->route('stock-movements.index')->with('success', 'Mouvement de stock enregistré.');
    }
}
