<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\Product;
use App\Services\ProductStockCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CatalogProductApiController extends Controller
{
    public function __construct(private ProductStockCalculator $stockCalculator) {}

    public function index()
    {
        $items = CatalogProduct::with('product')
            ->latest()
            ->get()
            ->map(fn (CatalogProduct $item) => $this->format($item));

        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id|unique:catalog_products,product_id',
            'category' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'price' => 'nullable|numeric|min:0',
            'photo' => 'nullable|image|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('catalog', 'public');
        }

        $item = CatalogProduct::create([
            'product_id' => $validated['product_id'],
            'category' => $validated['category'] ?? null,
            'brand' => $validated['brand'] ?? null,
            'description' => $validated['description'] ?? null,
            'photo_path' => $path,
            'price' => $validated['price'] ?? null,
        ]);

        return response()->json($this->format($item->load('product')), 201);
    }

    public function update(Request $request, CatalogProduct $catalog_product)
    {
        if ($request->has('price') && $request->input('price') === '') {
            $request->merge(['price' => null]);
        }

        $validated = $request->validate([
            'product_id' => 'sometimes|exists:products,id|unique:catalog_products,product_id,'.$catalog_product->id,
            'category' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'price' => 'nullable|numeric|min:0',
            'photo' => 'nullable|image|max:5120',
        ]);

        $data = [
            'category' => $validated['category'] ?? null,
            'brand' => $validated['brand'] ?? null,
            'description' => $validated['description'] ?? null,
        ];

        if (array_key_exists('price', $validated)) {
            $data['price'] = $validated['price'];
        }

        if (array_key_exists('product_id', $validated)) {
            $data['product_id'] = $validated['product_id'];
        }

        if ($request->hasFile('photo')) {
            if ($catalog_product->photo_path) {
                Storage::disk('public')->delete($catalog_product->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('catalog', 'public');
        }

        $catalog_product->update($data);

        return response()->json($this->format($catalog_product->fresh('product')));
    }

    public function destroy(CatalogProduct $catalog_product)
    {
        if ($catalog_product->photo_path) {
            Storage::disk('public')->delete($catalog_product->photo_path);
        }
        $catalog_product->delete();

        return response()->json(['message' => 'Fiche catalogue supprimée']);
    }

    private function format(CatalogProduct $item): array
    {
        /** @var Product|null $product */
        $product = $item->product;
        $stock = $product ? $this->stockCalculator->forProduct($product) : null;

        return [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'reference' => $product?->reference,
            'article_id' => $product?->article_id,
            'name' => $product?->name,
            'category' => $item->category,
            'brand' => $item->brand,
            'description' => $item->description,
            'price' => $item->price !== null ? number_format((float) $item->price, 2, '.', '') : null,
            'photo_url' => $item->photo_path ? '/storage/'.$item->photo_path : null,
            'unit' => $product?->unit,
            'quantity' => $stock ? $stock['quantity'] : 0,
            'sold_qty' => $stock ? $stock['sold'] : 0,
            'stock_actuel' => $stock ? $stock['stock_actuel'] : 0,
            'etat' => $stock['etat'] ?? null,
        ];
    }
}
