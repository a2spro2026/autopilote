@extends('layouts.batixpert')

@section('title', 'Tableau de bord')

@section('content')
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Ventes (Mois)</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ number_format($ventesMois, 2, ',', ' ') }}</p>
        <p class="text-xs mt-2 {{ $ventesEvolution >= 0 ? 'text-emerald-600' : 'text-red-600' }}">
            {{ $ventesEvolution >= 0 ? '+' : '' }}{{ $ventesEvolution }}% vs mois dernier
        </p>
    </div>
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Stock Total</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ number_format($stockTotal->total ?? 0, 2, ',', ' ') }}</p>
        <p class="text-xs text-slate-500 mt-2">{{ $stockTotal->count ?? 0 }} produits en stock</p>
    </div>
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Factures (Mois)</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ number_format($facturesMontant, 2, ',', ' ') }}</p>
        <p class="text-xs text-slate-500 mt-2">{{ $facturesMois }} factures émises</p>
    </div>
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Chantiers en cours</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ $chantiersEnCours }}</p>
        <p class="text-xs text-red-600 mt-2">{{ $chantiersEnRetard }} en retard</p>
    </div>
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Chiffre d'affaires</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ number_format($caAnnee, 2, ',', ' ') }}</p>
        <p class="text-xs text-emerald-600 mt-2">Année {{ now()->year }}</p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <div class="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Chantiers en cours</h3>
        <div class="space-y-4">
            @forelse($chantiers as $chantier)
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium text-slate-700">{{ $chantier->name }} - {{ $chantier->city }}</span>
                        <span class="text-slate-500">{{ $chantier->progress }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: {{ $chantier->progress }}%"></div>
                    </div>
                </div>
            @empty
                <p class="text-sm text-slate-500">Aucun chantier en cours.</p>
            @endforelse
        </div>
    </div>

    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Alertes & Notifications</h3>
        <div class="space-y-3">
            @foreach($lowStockProducts as $product)
                <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <span class="text-amber-500">⚠️</span>
                    <div>
                        <p class="text-sm font-medium text-slate-700">Stock faible</p>
                        <p class="text-xs text-slate-500">{{ $product->name }} - {{ $product->quantity_in_stock }} {{ $product->unit }}</p>
                    </div>
                </div>
            @endforeach
            @if($overdueInvoices > 0)
                <div class="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span class="text-red-500">🔴</span>
                    <div>
                        <p class="text-sm font-medium text-slate-700">Factures en retard</p>
                        <p class="text-xs text-slate-500">{{ $overdueInvoices }} facture(s) à régler</p>
                    </div>
                </div>
            @endif
            @if($chantiersEnRetard > 0)
                <div class="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <span class="text-orange-500">🏗️</span>
                    <div>
                        <p class="text-sm font-medium text-slate-700">Chantiers en retard</p>
                        <p class="text-xs text-slate-500">{{ $chantiersEnRetard }} chantier(s) dépassent l'échéance</p>
                    </div>
                </div>
            @endif
        </div>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100">
        <h3 class="font-semibold text-slate-800">Dernières factures clients</h3>
    </div>
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-slate-500 uppercase text-xs">
            <tr>
                <th class="px-5 py-3 text-left">Référence</th>
                <th class="px-5 py-3 text-left">Client</th>
                <th class="px-5 py-3 text-right">Montant</th>
                <th class="px-5 py-3 text-center">Statut</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($recentInvoices as $invoice)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-medium">{{ $invoice->reference }}</td>
                    <td class="px-5 py-3">{{ $invoice->client->name }}</td>
                    <td class="px-5 py-3 text-right">{{ number_format($invoice->total_ttc, 2, ',', ' ') }}</td>
                    <td class="px-5 py-3 text-center"><x-status-badge :status="$invoice->status" /></td>
                </tr>
            @empty
                <tr><td colspan="4" class="px-5 py-8 text-center text-slate-500">Aucune facture.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
