@extends('layouts.batixpert')
@section('title', $chantier->name)
@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-slate-800">{{ $chantier->name }}</h1>
        <p class="text-sm text-slate-500">{{ $chantier->reference }} — {{ $chantier->client->name }} — {{ $chantier->city }}</p>
    </div>
    <a href="{{ route('chantiers.edit', $chantier) }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Modifier</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl p-5 shadow-sm border">
        <div class="flex justify-between mb-2"><span class="text-sm text-slate-500">Progression</span><span class="font-semibold">{{ $chantier->progress }}%</span></div>
        <div class="w-full bg-slate-100 rounded-full h-3"><div class="bg-blue-600 h-3 rounded-full" style="width:{{ $chantier->progress }}%"></div></div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-slate-500">Budget:</span> {{ number_format($chantier->budget, 2, ',', ' ') }}</div>
            <div><span class="text-slate-500">Statut:</span> <x-status-badge :status="$chantier->status" /></div>
        </div>
    </div>

    <div class="bg-white rounded-xl p-5 shadow-sm border">
        <h3 class="font-semibold mb-3">Affecter un employé</h3>
        <form method="POST" action="{{ route('chantiers.assignments.store', $chantier) }}" class="flex gap-2">
            @csrf
            <select name="employee_id" required class="flex-1 rounded-lg border-slate-300 text-sm">
                <option value="">Choisir employé</option>
                @foreach($employees as $emp)<option value="{{ $emp->id }}">{{ $emp->full_name }} — {{ $emp->position }}</option>@endforeach
            </select>
            <input type="text" name="role" placeholder="Rôle" class="w-32 rounded-lg border-slate-300 text-sm">
            <button type="submit" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Affecter</button>
        </form>
        <div class="mt-4 space-y-2">
            @forelse($chantier->assignments as $assignment)
                <div class="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                    <span>{{ $assignment->employee->full_name }} <span class="text-slate-500">({{ $assignment->role ?? $assignment->employee->position }})</span></span>
                    <form method="POST" action="{{ route('chantiers.assignments.destroy', [$chantier, $assignment]) }}">@csrf @method('DELETE')<button class="text-red-600 text-xs">Retirer</button></form>
                </div>
            @empty
                <p class="text-sm text-slate-500">Aucun employé affecté.</p>
            @endforelse
        </div>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div class="px-5 py-4 border-b flex justify-between items-center">
        <h3 class="font-semibold">Besoins du chantier</h3>
        <form method="POST" action="{{ route('chantiers.besoins.store', $chantier) }}" class="flex gap-2">
            @csrf
            <input type="text" name="description" placeholder="Description" required class="rounded-lg border-slate-300 text-sm">
            <input type="number" step="0.001" name="quantity_needed" placeholder="Qté" required class="w-24 rounded-lg border-slate-300 text-sm">
            <button type="submit" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Ajouter</button>
        </form>
    </div>
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Description</th><th class="px-5 py-3 text-right">Besoin</th><th class="px-5 py-3 text-right">Alloué</th><th class="px-5 py-3 text-center">Statut</th><th class="px-5 py-3 text-right">Actions</th></tr></thead>
        <tbody class="divide-y">
            @forelse($chantier->besoins as $besoin)
                <tr>
                    <td class="px-5 py-3">{{ $besoin->description ?? $besoin->product?->name }}</td>
                    <td class="px-5 py-3 text-right">{{ $besoin->quantity_needed }}</td>
                    <td class="px-5 py-3 text-right">{{ $besoin->quantity_allocated }}</td>
                    <td class="px-5 py-3 text-center"><x-status-badge :status="$besoin->status" /></td>
                    <td class="px-5 py-3 text-right">
                        <form method="POST" action="{{ route('chantiers.besoins.destroy', [$chantier, $besoin]) }}" class="inline">@csrf @method('DELETE')<button class="text-red-600 text-xs">Supprimer</button></form>
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun besoin défini.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
