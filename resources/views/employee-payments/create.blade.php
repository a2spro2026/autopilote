@extends('layouts.batixpert')
@section('title', 'Nouveau paiement')
@section('content')
<x-page-header title="Nouveau paiement personnel" />
<form method="POST" action="{{ route('employee-payments.store') }}" class="bg-white rounded-xl border p-6 max-w-md">
    @csrf
    <div class="space-y-4">
        <div><label class="field-label-form">Employé *</label><select name="employee_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($employees as $e)<option value="{{ $e->id }}">{{ $e->full_name }} — {{ number_format($e->monthly_salary, 2, ',', ' ') }}</option>@endforeach</select></div>
        <div><label class="field-label-form">Début période *</label><input type="date" name="period_start" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Fin période *</label><input type="date" name="period_end" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Montant de base *</label><input type="number" step="0.01" name="base_amount" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Primes</label><input type="number" step="0.01" name="bonuses" value="0" class="w-full rounded-lg border-slate-300 text-sm"></div>
        <p class="text-xs text-slate-500">Les avances en cours seront automatiquement déduites.</p>
    </div>
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Valider le paiement</button>
</form>
@endsection
