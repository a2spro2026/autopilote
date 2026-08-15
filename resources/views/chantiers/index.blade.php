@extends('layouts.batixpert')
@section('title', 'Chantiers')
@section('content')
<x-page-header title="Suivi de chantier" :action="route('chantiers.create')" actionLabel="Nouveau chantier" />
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-slate-500 uppercase text-xs">
            <tr><th class="px-5 py-3 text-left">Réf.</th><th class="px-5 py-3 text-left">Chantier</th><th class="px-5 py-3 text-left">Client</th><th class="px-5 py-3 text-left">Ville</th><th class="px-5 py-3 text-center">Progression</th><th class="px-5 py-3 text-center">Statut</th><th class="px-5 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody class="divide-y">
            @forelse($chantiers as $chantier)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-mono text-xs">{{ $chantier->reference }}</td>
                    <td class="px-5 py-3 font-medium">{{ $chantier->name }}</td>
                    <td class="px-5 py-3">{{ $chantier->client->name }}</td>
                    <td class="px-5 py-3">{{ $chantier->city }}</td>
                    <td class="px-5 py-3"><div class="w-20 mx-auto bg-slate-100 rounded-full h-2"><div class="bg-blue-600 h-2 rounded-full" style="width:{{ $chantier->progress }}%"></div></div><span class="text-xs text-slate-500">{{ $chantier->progress }}%</span></td>
                    <td class="px-5 py-3 text-center"><x-status-badge :status="$chantier->status" /></td>
                    <td class="px-5 py-3 text-right"><a href="{{ route('chantiers.show', $chantier) }}" class="text-blue-600 hover:underline">Gérer</a></td>
                </tr>
            @empty
                <tr><td colspan="7" class="px-5 py-8 text-center text-slate-500">Aucun chantier.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-5 py-3">{{ $chantiers->links() }}</div>
</div>
@endsection
