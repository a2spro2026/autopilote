@props(['title', 'action' => null, 'actionLabel' => 'Ajouter', 'actionPermission' => null])

<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-slate-800">{{ $title }}</h1>
    @if($action && (!$actionPermission || auth()->user()->isAdmin() || auth()->user()->hasPermission($actionPermission)))
        <a href="{{ $action }}" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ $actionLabel }}
        </a>
    @endif
</div>
