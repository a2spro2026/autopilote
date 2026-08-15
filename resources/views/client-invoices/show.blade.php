@extends('layouts.batixpert')
@section('title', $clientInvoice->reference)
@section('content')
<x-page-header :title="'Facture '.$clientInvoice->reference" />
<div class="bg-white rounded-xl shadow-sm border p-6 max-w-3xl">
    <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div><span class="text-slate-500">Client:</span> {{ $clientInvoice->client->name }}</div>
        <div><span class="text-slate-500">Date:</span> {{ $clientInvoice->invoice_date->format('d/m/Y') }}</div>
        <div><span class="text-slate-500">Statut:</span> <x-status-badge :status="$clientInvoice->status" /></div>
        <div><span class="text-slate-500">Reste à payer:</span> {{ number_format($clientInvoice->remainingAmount(), 2, ',', ' ') }}</div>
    </div>
    <table class="w-full text-sm mb-4">
        <thead class="bg-slate-50 font-bold"><tr><th class="px-3 py-2 text-left">Description</th><th class="px-3 py-2 text-right">Qté</th><th class="px-3 py-2 text-right">P.U.</th><th class="px-3 py-2 text-right">Total</th></tr></thead>
        <tbody class="divide-y">@foreach($clientInvoice->items as $item)<tr><td class="px-3 py-2">{{ $item->description }}</td><td class="px-3 py-2 text-right">{{ $item->quantity }}</td><td class="px-3 py-2 text-right">{{ number_format($item->unit_price, 2) }}</td><td class="px-3 py-2 text-right">{{ number_format($item->total, 2) }}</td></tr>@endforeach</tbody>
        <tfoot><tr class="font-semibold"><td colspan="3" class="px-3 py-2 text-right">Total TTC</td><td class="px-3 py-2 text-right">{{ number_format($clientInvoice->total_ttc, 2, ',', ' ') }}</td></tr></tfoot>
    </table>
</div>
@endsection
