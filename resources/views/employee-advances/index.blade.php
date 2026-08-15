@extends('layouts.batixpert')
@section('title', 'Avances')
@section('content')
<div class="flex justify-between mb-6"><h1 class="text-2xl font-bold">Avances personnel</h1><a href="{{ route('employee-advances.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Nouvelle avance</a></div>
<div class="bg-white rounded-xl border overflow-hidden"><table class="w-full text-sm"><thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Employé</th><th class="px-5 py-3 text-left">Date</th><th class="px-5 py-3 text-right">Montant</th><th class="px-5 py-3 text-center">Statut</th></tr></thead><tbody class="divide-y">@forelse($advances as $a)<tr><td class="px-5 py-3">{{ $a->employee->full_name }}</td><td class="px-5 py-3">{{ $a->advance_date->format('d/m/Y') }}</td><td class="px-5 py-3 text-right">{{ number_format($a->amount, 2) }}</td><td class="px-5 py-3 text-center"><x-status-badge :status="$a->status" /></td></tr>@empty<tr><td colspan="4" class="px-5 py-8 text-center text-slate-500">Aucune avance.</td></tr>@endforelse</tbody></table><div class="px-5 py-3">{{ $advances->links() }}</div></div>
@endsection
