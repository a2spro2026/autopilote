@extends('layouts.batixpert')
@section('title', 'Utilisateurs')
@section('content')
<x-page-header title="Gestion des utilisateurs" :action="route('users.create')" actionLabel="Nouvel utilisateur" />
<div class="bg-white rounded-xl border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Nom</th><th class="px-5 py-3 text-left">Email</th><th class="px-5 py-3 text-left">Rôle</th><th class="px-5 py-3 text-center">Actif</th><th class="px-5 py-3 text-right">Actions</th></tr></thead>
        <tbody class="divide-y">@forelse($users as $user)<tr><td class="px-5 py-3 font-medium">{{ $user->name }}</td><td class="px-5 py-3">{{ $user->email }}</td><td class="px-5 py-3">{{ $user->role?->name ?? '-' }}</td><td class="px-5 py-3 text-center">{{ $user->is_active ? '✓' : '✗' }}</td><td class="px-5 py-3 text-right"><a href="{{ route('users.edit', $user) }}" class="text-blue-600">Modifier</a></td></tr>@empty<tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun utilisateur.</td></tr>@endforelse</tbody>
    </table>
    <div class="px-5 py-3">{{ $users->links() }}</div>
</div>
@endsection
