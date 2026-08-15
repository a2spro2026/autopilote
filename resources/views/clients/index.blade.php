@extends('layouts.batixpert')
@section('title', 'Clients')
@section('content')
<x-page-header title="Clients" :action="route('clients.create')" actionLabel="Nouveau client" actionPermission="clients.create" />
<div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-slate-500 uppercase text-xs">
            <tr>
                <th class="px-5 py-3 text-left">Nom</th>
                <th class="px-5 py-3 text-left">Contact</th>
                <th class="px-5 py-3 text-left">Ville</th>
                <th class="px-5 py-3 text-center">Statut</th>
                <th class="px-5 py-3 text-right">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($clients as $client)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-medium">{{ $client->name }}</td>
                    <td class="px-5 py-3">{{ $client->contact_person ?? '-' }}</td>
                    <td class="px-5 py-3">{{ $client->city ?? '-' }}</td>
                    <td class="px-5 py-3 text-center"><x-status-badge :status="$client->status" /></td>
                    <td class="px-5 py-3 text-right space-x-2">
                        <a href="{{ route('clients.show', $client) }}" class="text-blue-600 hover:underline">Voir</a>
                        <a href="{{ route('clients.edit', $client) }}" class="text-slate-600 hover:underline">Modifier</a>
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun client.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-5 py-3">{{ $clients->links() }}</div>
</div>
@endsection
