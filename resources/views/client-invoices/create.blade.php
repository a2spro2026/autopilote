@extends('layouts.batixpert')
@section('title', 'Nouvelle facture client')
@section('content')
<x-page-header title="Nouvelle facture client" />
<form method="POST" action="{{ route('client-invoices.store') }}" class="bg-white rounded-xl shadow-sm border p-6">
    @csrf
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div><label class="field-label-form">Client *</label><select name="client_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($clients as $c)<option value="{{ $c->id }}">{{ $c->name }}</option>@endforeach</select></div>
        <div><label class="field-label-form">Chantier</label><select name="chantier_id" class="w-full rounded-lg border-slate-300 text-sm"><option value="">--</option>@foreach($chantiers as $ch)<option value="{{ $ch->id }}">{{ $ch->name }}</option>@endforeach</select></div>
        <div><label class="field-label-form">Référence *</label><input type="text" name="reference" value="{{ old('reference', 'FC-'.date('Ymd-His')) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Date *</label><input type="date" name="invoice_date" value="{{ old('invoice_date', date('Y-m-d')) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Échéance</label><input type="date" name="due_date" class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Statut</label><select name="status" class="w-full rounded-lg border-slate-300 text-sm"><option value="en_attente">En attente</option><option value="brouillon">Brouillon</option></select></div>
    </div>
    <h3 class="font-semibold mb-3">Lignes de facture</h3>
    <div id="invoice-lines" class="space-y-2 mb-4">
        <div class="grid grid-cols-12 gap-2 items-end">
            <div class="col-span-6"><input type="text" name="items[0][description]" placeholder="Description" required class="w-full rounded-lg border-slate-300 text-sm"></div>
            <div class="col-span-2"><input type="number" step="0.001" name="items[0][quantity]" value="1" required class="w-full rounded-lg border-slate-300 text-sm"></div>
            <div class="col-span-3"><input type="number" step="0.01" name="items[0][unit_price]" placeholder="Prix unit." required class="w-full rounded-lg border-slate-300 text-sm"></div>
        </div>
    </div>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Créer la facture</button>
</form>
@endsection
