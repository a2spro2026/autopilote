@extends('layouts.batixpert')
@section('title', 'Modifier client')
@section('content')
<x-page-header title="Modifier client" />
<form method="POST" action="{{ route('clients.update', $client) }}" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 max-w-2xl">
    @csrf @method('PUT')
    @include('clients._form')
    <div class="mt-6 flex gap-3">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Mettre à jour</button>
        <a href="{{ route('clients.index') }}" class="px-4 py-2 text-sm text-slate-600">Annuler</a>
    </div>
</form>
@endsection
