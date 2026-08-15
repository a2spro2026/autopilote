@extends('layouts.batixpert')
@section('title', 'Règlements')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Paiements & Trésorerie</h1>
    <div class="flex gap-2">
        <a href="{{ route('employee-payments.index') }}" class="px-4 py-2 border rounded-lg text-sm">Paie personnel</a>
        <a href="{{ route('employee-advances.index') }}" class="px-4 py-2 border rounded-lg text-sm">Avances</a>
        <a href="{{ route('payments.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Nouveau règlement</a>
    </div>
</div>
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-xs uppercase text-slate-500"><tr><th class="px-5 py-3 text-left">Date</th><th class="px-5 py-3 text-left">Type</th><th class="px-5 py-3 text-right">Montant</th><th class="px-5 py-3 text-left">Méthode</th><th class="px-5 py-3 text-left">Réf.</th></tr></thead>
        <tbody class="divide-y">@forelse($payments as $payment)<tr><td class="px-5 py-3">{{ $payment->payment_date->format('d/m/Y') }}</td><td class="px-5 py-3 capitalize">{{ $payment->type }}</td><td class="px-5 py-3 text-right font-medium">{{ number_format($payment->amount, 2) }}</td><td class="px-5 py-3">{{ ucfirst($payment->method) }}</td><td class="px-5 py-3">{{ $payment->reference ?? '-' }}</td></tr>@empty<tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun règlement.</td></tr>@endforelse</tbody>
    </table>
    <div class="px-5 py-3">{{ $payments->links() }}</div>
</div>
@endsection
