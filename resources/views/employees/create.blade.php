@extends('layouts.batixpert')
@section('title', 'Nouvel employé')
@section('content')
<x-page-header title="Nouvel employé" />
<form method="POST" action="{{ route('employees.store') }}" class="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
    @csrf @include('employees._form')
    <button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Enregistrer</button>
</form>
@endsection
