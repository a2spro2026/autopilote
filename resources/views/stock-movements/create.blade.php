@extends('layouts.batixpert')
@section('title', 'Nouveau mouvement')
@section('content')
<x-page-header title="Nouveau mouvement de stock" />
<form method="POST" action="{{ route('stock-movements.store') }}" class="bg-white rounded-xl border p-6 max-w-md">
    @csrf
    <div class="space-y-4">
        <div><label class="field-label-form">Produit *</label><select name="product_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($products as $p)<option value="{{ $p->id }}">{{ $p->name }} ({{ $p->quantity_in_stock }} {{ $p->unit }})</option>@endforeach</select></div>
        <div><label class="field-label-form">Type *</label><select name="type" required class="w-full rounded-lg border-slate-300 text-sm"><option value="entree">Entrée</option><option value="sortie">Sortie</option></select></div>
        <div><label class="field-label-form">Quantité *</label><input type="number" step="0.001" name="quantity" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Chantier (sortie)</label><select name="chantier_id" class="w-full rounded-lg border-slate-300 text-sm"><option value="">--</option>@foreach($chantiers as $c)<option value="{{ $c->id }}">{{ $c->name }}</option>@endforeach</select></div>
        <div><label class="field-label-form">Notes</label><textarea name="notes" rows="2" class="w-full rounded-lg border-slate-300 text-sm"></textarea></div>
    </div>
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Enregistrer</button>
</form>
@endsection
