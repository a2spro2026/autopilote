@extends('layouts.batixpert')
@section('title', 'Nouvel utilisateur')
@section('content')
<x-page-header title="Nouvel utilisateur" />
<form method="POST" action="{{ route('users.store') }}" class="bg-white rounded-xl border p-6 max-w-md">
    @csrf @include('users._form')
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Créer</button>
</form>
@endsection
