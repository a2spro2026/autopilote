@extends('layouts.batixpert')
@section('title', 'Personnel')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Personnel</h1>
    <a href="{{ route('employees.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Nouvel employé</a>
</div>
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Nom</th><th class="px-5 py-3 text-left">Poste</th><th class="px-5 py-3 text-right">Salaire</th><th class="px-5 py-3 text-center">Statut</th><th class="px-5 py-3 text-right">Actions</th></tr></thead>
        <tbody class="divide-y">@forelse($employees as $employee)<tr><td class="px-5 py-3 font-medium">{{ $employee->full_name }}</td><td class="px-5 py-3">{{ $employee->position }}</td><td class="px-5 py-3 text-right">{{ number_format($employee->monthly_salary, 2, ',', ' ') }}</td><td class="px-5 py-3 text-center"><x-status-badge :status="$employee->status" /></td><td class="px-5 py-3 text-right"><a href="{{ route('employees.show', $employee) }}" class="text-blue-600">Voir</a></td></tr>@empty<tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun employé.</td></tr>@endforelse</tbody>
    </table>
    <div class="px-5 py-3">{{ $employees->links() }}</div>
</div>
@endsection
