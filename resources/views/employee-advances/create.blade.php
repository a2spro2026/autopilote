@extends('layouts.batixpert')
@section('title', 'Nouvelle avance')
@section('content')
<x-page-header title="Nouvelle avance" />
<form method="POST" action="{{ route('employee-advances.store') }}" class="bg-white rounded-xl border p-6 max-w-md">
    @csrf
    <div class="space-y-4">
        <div><label class="field-label-form">Employé *</label><select name="employee_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($employees as $e)<option value="{{ $e->id }}">{{ $e->full_name }}</option>@endforeach</select></div>
        <div><label class="field-label-form">Montant *</label><input type="number" step="0.01" name="amount" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Date *</label><input type="date" name="advance_date" value="{{ date('Y-m-d') }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
        <div><label class="field-label-form">Motif</label><input type="text" name="reason" class="w-full rounded-lg border-slate-300 text-sm"></div>
    </div>
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Enregistrer</button>
</form>
@endsection
