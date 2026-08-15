@extends('layouts.batixpert')
@section('title', $client->name)
@section('content')
<x-page-header :title="$client->name" :action="route('clients.edit', $client)" actionLabel="Modifier" />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold mb-4">Informations</h3>
        <dl class="space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">Contact</dt><dd>{{ $client->contact_person ?? '-' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Email</dt><dd>{{ $client->email ?? '-' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Téléphone</dt><dd>{{ $client->phone ?? '-' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Ville</dt><dd>{{ $client->city ?? '-' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Statut</dt><dd><x-status-badge :status="$client->status" /></dd></div>
        </dl>
    </div>
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold mb-4">Chantiers ({{ $client->chantiers->count() }})</h3>
        @forelse($client->chantiers as $chantier)
            <a href="{{ route('chantiers.show', $chantier) }}" class="block py-2 text-sm text-blue-600 hover:underline">{{ $chantier->name }}</a>
        @empty
            <p class="text-sm text-slate-500">Aucun chantier.</p>
        @endforelse
    </div>
</div>
@endsection
