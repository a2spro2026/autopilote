@extends('layouts.batixpert')
@section('title', 'Nouveau règlement')
@section('content')
<x-page-header title="Nouveau règlement" />
<form method="POST" action="{{ route('payments.store') }}" class="bg-white rounded-xl shadow-sm border p-6 max-w-xl">
    @csrf
    <div class="space-y-4">
        <div><label class="field-label-form">Type *</label><select name="type" id="payment-type" required class="w-full rounded-lg border-slate-300 text-sm"><option value="client">Facture client</option><option value="fournisseur">Facture fournisseur</option><option value="personnel">Paiement personnel</option></select></div>
        <div><label class="field-label-form">Document *</label><select name="payable_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($clientInvoices as $inv)<option value="{{ $inv->id }}" data-type="client">{{ $inv->reference }} — {{ $inv->client->name }} ({{ number_format($inv->remainingAmount(), 2) }})</option>@endforeach</select></div>
        <div><label class="field-label-form">Montant *</label><input type="number" step="0.01" name="amount" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Date *</label><input type="date" name="payment_date" value="{{ date('Y-m-d') }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Méthode</label><select name="method" class="w-full rounded-lg border-slate-300 text-sm"><option value="virement">Virement</option><option value="especes">Espèces</option><option value="cheque">Chèque</option><option value="carte">Carte</option></select></div>
        <div><label class="field-label-form">Référence</label><input type="text" name="reference" class="w-full rounded-lg border-slate-300 text-sm"></div>
    </div>
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Enregistrer</button>
</form>
@endsection
