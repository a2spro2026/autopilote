<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductApiController extends Controller
{
    private ?array $purchasedCache = null;

    public function index(Request $request)
    {
        $query = Product::query()
            ->with('category')
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('reference', 'like', "%{$s}%")
                    ->orWhere('article_id', 'like', "%{$s}%")
                    ->orWhere('code_barre', 'like', "%{$s}%")
                    ->orWhere('famille', 'like', "%{$s}%")
                    ->orWhere('brand', 'like', "%{$s}%");
            }))
            ->when($request->filled('reference'), fn ($q) => $q->where('reference', 'like', '%'.$request->reference.'%'))
            ->when($request->filled('code_barre'), fn ($q) => $q->where('code_barre', 'like', '%'.$request->code_barre.'%'))
            ->when($request->filled('designation'), fn ($q) => $q->where('name', 'like', '%'.$request->designation.'%'))
            ->orderBy('id');

        if ($request->boolean('all')) {
            $products = $query->get()->map(fn ($p) => $this->formatProduct($p));
            $familles = Product::whereNotNull('famille')
                ->where('famille', '!=', '')
                ->distinct()
                ->orderBy('famille')
                ->pluck('famille')
                ->values();
            $categories = ProductCategory::orderBy('name')->pluck('name')->values();
            $marques = Product::whereNotNull('brand')
                ->where('brand', '!=', '')
                ->distinct()
                ->orderBy('brand')
                ->pluck('brand')
                ->values();

            return response()->json([
                'data' => $products,
                'meta' => [
                    'next_ref' => $this->nextReference(),
                    'familles' => $familles,
                    'categories' => $categories,
                    'marques' => $marques,
                ],
            ]);
        }

        return response()->json(
            $query->paginate(15)->through(fn ($p) => $this->formatProduct($p))
        );
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated = $this->applyCategory($validated);
        $initialStock = (float) ($validated['initial_stock'] ?? 0);
        $reference = trim((string) ($validated['reference'] ?? ''));

        $product = DB::transaction(function () use ($validated, $initialStock, $reference) {
            $product = Product::create([
                ...$validated,
                'reference' => $reference !== '' ? $reference : 'Réf-PENDING',
                'quantity_in_stock' => $initialStock,
                'min_stock_alert' => $validated['min_stock_alert'] ?? 0,
                'etat' => $validated['etat'] ?? 'Rupture',
            ]);

            if ($reference === '') {
                $product->update(['reference' => $this->referenceFor($product->id)]);
            }

            return $product->load('category');
        });

        return response()->json($this->formatProduct($product), 201);
    }

    public function show(Product $product)
    {
        return response()->json($this->formatProduct($product));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $this->applyCategory($this->validated($request, $product->id));

        if (array_key_exists('initial_stock', $validated)) {
            $validated['quantity_in_stock'] = (float) $validated['initial_stock'];
        }

        $product->update($validated);

        return response()->json($this->formatProduct($product->fresh()->load('category')));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $articleUnique = 'unique:products,article_id';
        $refUnique = 'unique:products,reference';
        if ($ignoreId) {
            $articleUnique .= ','.$ignoreId;
            $refUnique .= ','.$ignoreId;
        }

        return $request->validate([
            'reference' => 'required|string|max:100|'.$refUnique,
            'name' => 'required|string|max:500',
            'article_id' => 'nullable|string|max:50|'.$articleUnique,
            'code_barre' => 'nullable|string|max:100',
            'consistance' => 'nullable|string|max:10',
            'unit' => 'required|string|in:Kg,U,Sac,ML,M²,M³,Tn,M',
            'famille' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'initial_stock' => 'numeric|min:0',
            'min_stock_alert' => 'nullable|numeric|min:0',
            'status' => 'in:actif,inactif',
            'etat' => 'nullable|in:Dispo,Faible,Rupture',
        ]);
    }

    private function applyCategory(array $validated): array
    {
        if (array_key_exists('categorie', $validated)) {
            $name = trim((string) ($validated['categorie'] ?? ''));
            unset($validated['categorie']);
            if ($name !== '') {
                $category = ProductCategory::firstOrCreate(['name' => $name]);
                $validated['category_id'] = $category->id;
            } else {
                $validated['category_id'] = null;
            }
        }

        return $validated;
    }

    private function nextReference(): string
    {
        return $this->referenceFor((Product::max('id') ?? 0) + 1);
    }

    private function referenceFor(int $id): string
    {
        return 'Réf-'.str_pad((string) $id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Quantités achetées par produit (bons d'achat non annulés),
     * indexées par product_id et par référence article.
     */
    private function purchasedQuantities(): array
    {
        if ($this->purchasedCache !== null) {
            return $this->purchasedCache;
        }

        $map = ['by_id' => [], 'by_ref' => []];

        if (Schema::hasTable('purchase_order_items') && Schema::hasTable('purchase_orders')) {
            $rows = DB::table('purchase_order_items as poi')
                ->join('purchase_orders as po', 'po.id', '=', 'poi.purchase_order_id')
                ->where('po.status', '!=', 'annule')
                ->selectRaw('poi.product_id, poi.article_ref, SUM(poi.quantity) as qty')
                ->groupBy('poi.product_id', 'poi.article_ref')
                ->get();

            foreach ($rows as $row) {
                $qty = (float) $row->qty;

                if ($row->product_id) {
                    $map['by_id'][(int) $row->product_id] = ($map['by_id'][(int) $row->product_id] ?? 0) + $qty;

                    continue;
                }

                $ref = trim((string) $row->article_ref);
                if ($ref !== '') {
                    $key = mb_strtolower($ref);
                    $map['by_ref'][$key] = ($map['by_ref'][$key] ?? 0) + $qty;
                }
            }
        }

        return $this->purchasedCache = $map;
    }

    private function purchasedFor(Product $product): float
    {
        $map = $this->purchasedQuantities();
        $qty = $map['by_id'][$product->id] ?? 0;

        $refs = array_unique(array_filter([
            mb_strtolower(trim((string) $product->article_id)),
            mb_strtolower(trim((string) $product->reference)),
        ]));

        foreach ($refs as $ref) {
            $qty += $map['by_ref'][$ref] ?? 0;
        }

        return (float) $qty;
    }

    private function formatProduct(Product $product): array
    {
        $purchased = $this->purchasedFor($product);
        // Calculé à la volée — ne pas écrire en base à chaque lecture (lenteur majeure).
        $stock = round((float) $product->initial_stock + $purchased, 3);
        $min = (float) $product->min_stock_alert;
        $etat = $product->etat ?: ($stock <= 0 ? 'Rupture' : ($stock <= $min ? 'Faible' : 'Dispo'));

        return [
            'id' => $product->id,
            'reference' => $product->reference,
            'article_id' => $product->article_id,
            'code_barre' => $product->code_barre,
            'name' => $product->name,
            'designation' => $product->name,
            'consistance' => $product->consistance,
            'unit' => $product->unit,
            'famille' => $product->famille,
            'brand' => $product->brand,
            'marque' => $product->brand,
            'unit_price' => (float) $product->unit_price,
            'purchase_price' => (float) $product->purchase_price,
            'category_id' => $product->category_id,
            'categorie' => $product->category?->name,
            'initial_stock' => (float) $product->initial_stock,
            'stock_initial' => (float) $product->initial_stock,
            'purchased_qty' => $purchased,
            'quantity_in_stock' => $stock,
            'min_stock_alert' => $min,
            'status' => $product->status,
            'statut' => $product->status === 'actif' ? 'Actif' : 'Inactif',
            'etat' => $etat,
            'created_at' => $product->created_at?->format('d/m/Y'),
        ];
    }
}
