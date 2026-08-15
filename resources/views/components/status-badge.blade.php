@props(['status'])

@php
    $classes = match($status) {
        'actif', 'payee', 'paye', 'valide', 'livre', 'termine' => 'bg-emerald-100 text-emerald-700',
        'en_cours', 'en_attente', 'partielle', 'commande', 'planifie' => 'bg-amber-100 text-amber-700',
        'en_retard', 'suspendu' => 'bg-red-100 text-red-700',
        'inactif', 'annule', 'annulee', 'brouillon' => 'bg-slate-100 text-slate-600',
        default => 'bg-blue-100 text-blue-700',
    };
    $label = str_replace('_', ' ', ucfirst($status));
@endphp

<span {{ $attributes->merge(['class' => "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {$classes}"]) }}>
    {{ $label }}
</span>
