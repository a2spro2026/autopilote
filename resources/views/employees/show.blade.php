@extends('layouts.batixpert')
@section('title', $employee->full_name)
@section('content')
<x-page-header :title="$employee->full_name" />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white rounded-xl p-5 border"><h3 class="font-semibold mb-3">Informations</h3><dl class="text-sm space-y-2"><div class="flex justify-between"><dt class="text-slate-500">Poste</dt><dd>{{ $employee->position }}</dd></div><div class="flex justify-between"><dt class="text-slate-500">Salaire</dt><dd>{{ number_format($employee->monthly_salary, 2, ',', ' ') }}</dd></div></dl></div>
    <div class="bg-white rounded-xl p-5 border"><h3 class="font-semibold mb-3">Avances récentes</h3>@forelse($employee->advances->take(5) as $a)<div class="flex justify-between text-sm py-1"><span>{{ $a->advance_date->format('d/m/Y') }}</span><span>{{ number_format($a->amount, 2, ',', ' ') }}</span></div>@empty<p class="text-sm text-slate-500">Aucune avance.</p>@endforelse</div>
</div>
@endsection
