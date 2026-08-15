@extends('layouts.batixpert')
@section('title', 'Nouvelle facture fournisseur')
@section('content')
<x-page-header title="Nouvelle facture fournisseur" />
<form method="POST" action="{{ route('supplier-invoices.store') }}" class="bg-white rounded-xl shadow-sm border p-6">
    @csrf
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div><label class="field-label-form">Fournisseur *</label><select name="supplier_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($suppliers as $s)<option value="{{ $s->id }}">{{ $s->name }}</option>@endforeach</select></div>
        <div><label class="field-label-form">Référence *</label><input type="text" name="reference" value="{{ old('reference', 'FF-'.date('Ymd-His')) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Date *</label><input type="date" name="invoice_date" value="{{ date('Y-m-d') }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <input type="hidden" name="status" value="en_attente">
    </div>
    <div class="grid grid-cols-12 gap-2 mb-4">
        <div class="col-span-6"><input type="text" name="items[0][description]" placeholder="Description" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div class="col-span-2"><input type="number" step="0.001" name="items[0][quantity]" value="1" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div class="col-span-3"><input type="number" step="0.01" name="items[0][unit_price]" placeholder="Prix" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    </div>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Créer</button>
</form>
@endsection
