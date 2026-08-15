@extends('layouts.batixpert')
@section('title', 'Modifier fournisseur')
@section('content')
<x-page-header title="Modifier fournisseur" />
<form method="POST" action="{{ route('suppliers.update', $supplier) }}" class="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
    @csrf @method('PUT')
    @include('suppliers._form')
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Mettre à jour</button>
</form>
@endsection
