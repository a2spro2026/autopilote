@extends('layouts.batixpert')
@section('title', 'Nouveau chantier')
@section('content')
<x-page-header title="Nouveau chantier" />
<form method="POST" action="{{ route('chantiers.store') }}" class="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
    @csrf @include('chantiers._form')
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Enregistrer</button>
</form>
@endsection
