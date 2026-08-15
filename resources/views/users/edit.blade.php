@extends('layouts.batixpert')
@section('title', 'Modifier utilisateur')
@section('content')
<x-page-header title="Modifier utilisateur" />
<form method="POST" action="{{ route('users.update', $user) }}" class="bg-white rounded-xl border p-6 max-w-md">
    @csrf @method('PUT') @include('users._form')
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Mettre à jour</button>
</form>
@endsection
