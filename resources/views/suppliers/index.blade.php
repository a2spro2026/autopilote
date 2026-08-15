@extends('layouts.batixpert')
@section('title', 'Fournisseurs')
@section('content')
<x-page-header title="Achats & Fournisseurs" :action="route('suppliers.create')" actionLabel="Nouveau fournisseur" />
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 font-bold text-slate-500 uppercase text-xs">
            <tr><th class="px-5 py-3 text-left">Nom</th><th class="px-5 py-3 text-left">Contact</th><th class="px-5 py-3 text-left">Ville</th><th class="px-5 py-3 text-center">Statut</th><th class="px-5 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody class="divide-y">
            @forelse($suppliers as $supplier)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-medium">{{ $supplier->name }}</td>
                    <td class="px-5 py-3">{{ $supplier->contact_person ?? '-' }}</td>
                    <td class="px-5 py-3">{{ $supplier->city ?? '-' }}</td>
                    <td class="px-5 py-3 text-center"><x-status-badge :status="$supplier->status" /></td>
                    <td class="px-5 py-3 text-right"><a href="{{ route('suppliers.edit', $supplier) }}" class="text-blue-600 hover:underline">Modifier</a></td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Aucun fournisseur.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-5 py-3">{{ $suppliers->links() }}</div>
</div>
@endsection
