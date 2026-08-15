@extends('layouts.batixpert')
@section('title', 'Stock')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-slate-800">Stocks & Inventaire</h1>
    <div class="flex gap-2">
        <a href="{{ route('stock-movements.create') }}" class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Mouvement stock</a>
        <a href="{{ route('products.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Nouveau produit</a>
    </div>
</div>
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-slate-500 uppercase text-xs">
            <tr><th class="px-5 py-3 text-left">Réf.</th><th class="px-5 py-3 text-left">Produit</th><th class="px-5 py-3 text-right">Stock</th><th class="px-5 py-3 text-right">Prix unit.</th><th class="px-5 py-3 text-center">Alerte</th><th class="px-5 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody class="divide-y">
            @forelse($products as $product)
                <tr class="hover:bg-slate-50 {{ $product->isLowStock() ? 'bg-amber-50' : '' }}">
                    <td class="px-5 py-3 font-mono text-xs">{{ $product->reference }}</td>
                    <td class="px-5 py-3 font-medium">{{ $product->name }}</td>
                    <td class="px-5 py-3 text-right">{{ number_format($product->quantity_in_stock, 2) }} {{ $product->unit }}</td>
                    <td class="px-5 py-3 text-right">{{ number_format($product->unit_price, 2) }}</td>
                    <td class="px-5 py-3 text-center">@if($product->isLowStock())<span class="text-amber-600 text-xs font-medium">Stock faible</span>@endif</td>
                    <td class="px-5 py-3 text-right"><a href="{{ route('products.edit', $product) }}" class="text-blue-600 hover:underline">Modifier</a></td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">Aucun produit.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-5 py-3">{{ $products->links() }}</div>
</div>
@endsection
