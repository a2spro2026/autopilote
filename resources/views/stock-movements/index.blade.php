@extends('layouts.batixpert')
@section('title', 'Mouvements stock')
@section('content')
<x-page-header title="Mouvements de stock" :action="route('stock-movements.create')" actionLabel="Nouveau mouvement" />
<div class="bg-white rounded-xl border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Date</th><th class="px-5 py-3 text-left">Produit</th><th class="px-5 py-3 text-center">Type</th><th class="px-5 py-3 text-right">Quantité</th><th class="px-5 py-3 text-left">Chantier</th></tr></thead>
        <tbody class="divide-y">@forelse($movements as $m)<tr><td class="px-5 py-3">{{ $m->created_at->format('d/m/Y H:i') }}</td><td class="px-5 py-3">{{ $m->product->name }}</td><td class="px-5 py-3 text-center"><x-status-badge :status="$m->type" /></td><td class="px-5 py-3 text-right">{{ $m->quantity }}</td><td class="px-5 py-3">{{ $m->chantier?->name ?? '-' }}</td></tr>@empty<tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun mouvement.</td></tr>@endforelse</tbody>
    </table>
    <div class="px-5 py-3">{{ $movements->links() }}</div>
</div>
@endsection
