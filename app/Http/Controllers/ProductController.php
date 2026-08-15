<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->latest()->paginate(15);

        return view('products.index', compact('products'));
    }

    public function create()
    {
        $categories = ProductCategory::orderBy('name')->get();

        return view('products.create', compact('categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'reference' => 'required|string|max:50|unique:products',
            'unit' => 'required|string|max:20',
            'unit_price' => 'required|numeric|min:0',
            'quantity_in_stock' => 'required|numeric|min:0',
            'min_stock_alert' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:actif,inactif',
        ]);

        Product::create($validated);

        return redirect()->route('products.index')->with('success', 'Produit créé avec succès.');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'stockMovements' => fn ($q) => $q->latest()->limit(10)]);

        return view('products.show', compact('product'));
    }

    public function edit(Product $product)
    {
        $categories = ProductCategory::orderBy('name')->get();

        return view('products.edit', compact('product', 'categories'));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'reference' => 'required|string|max:50|unique:products,reference,'.$product->id,
            'unit' => 'required|string|max:20',
            'unit_price' => 'required|numeric|min:0',
            'quantity_in_stock' => 'required|numeric|min:0',
            'min_stock_alert' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:actif,inactif',
        ]);

        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Produit mis à jour.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produit supprimé.');
    }
}
