@extends('layouts.batixpert')
@section('title', 'Factures clients')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Facturation</h1>
    <div class="flex gap-2">
        <a href="{{ route('supplier-invoices.index') }}" class="px-4 py-2 border rounded-lg text-sm">Factures fournisseurs</a>
        <a href="{{ route('client-invoices.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Nouvelle facture client</a>
    </div>
</div>
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Réf.</th><th class="px-5 py-3 text-left">Client</th><th class="px-5 py-3 text-left">Date</th><th class="px-5 py-3 text-right">Montant TTC</th><th class="px-5 py-3 text-center">Statut</th><th class="px-5 py-3 text-right">Actions</th></tr></thead>
        <tbody class="divide-y">
            @forelse($invoices as $invoice)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-medium">{{ $invoice->reference }}</td>
                    <td class="px-5 py-3">{{ $invoice->client->name }}</td>
                    <td class="px-5 py-3">{{ $invoice->invoice_date->format('d/m/Y') }}</td>
                    <td class="px-5 py-3 text-right">{{ number_format($invoice->total_ttc, 2, ',', ' ') }}</td>
                    <td class="px-5 py-3 text-center"><x-status-badge :status="$invoice->status" /></td>
                    <td class="px-5 py-3 text-right"><a href="{{ route('client-invoices.show', $invoice) }}" class="text-blue-600">Voir</a></td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">Aucune facture.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-5 py-3">{{ $invoices->links() }}</div>
</div>
@endsection
