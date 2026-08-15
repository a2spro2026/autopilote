@php
    $menu = [
        ['route' => 'dashboard', 'label' => 'Tableau de bord', 'icon' => 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 'permission' => 'dashboard.view'],
        ['route' => 'clients.index', 'label' => 'Clients', 'icon' => 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', 'permission' => 'clients.view'],
        ['route' => 'suppliers.index', 'label' => 'Achats & Fournisseurs', 'icon' => 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', 'permission' => 'fournisseurs.view'],
        ['route' => 'products.index', 'label' => 'Stocks & Inventaire', 'icon' => 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', 'permission' => 'stock.view'],
        ['route' => 'client-invoices.index', 'label' => 'Facturation', 'icon' => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'permission' => 'factures_clients.view'],
        ['route' => 'chantiers.index', 'label' => 'Suivi de chantier', 'icon' => 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', 'permission' => 'chantiers.view'],
        ['route' => 'payments.index', 'label' => 'Paiements & Trésorerie', 'icon' => 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 'permission' => 'reglements.view'],
        ['route' => 'employees.index', 'label' => 'Personnel', 'icon' => 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 'permission' => 'personnel.view'],
        ['route' => 'users.index', 'label' => 'Paramètres', 'icon' => 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', 'permission' => 'utilisateurs.view'],
    ];
@endphp

<aside class="w-64 bg-slate-900 text-white flex flex-col shrink-0">
    <div class="p-5 border-b border-slate-700">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">SP</div>
            <div>
                <div class="font-bold text-lg leading-tight">Autopilote</div>
                <div class="text-[10px] text-slate-400 leading-tight">Gestion commerciale</div>
            </div>
        </div>
    </div>

    <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        @foreach ($menu as $item)
            @if(auth()->user()->isAdmin() || auth()->user()->hasPermission($item['permission']))
                @php $active = request()->routeIs(str_replace('.index', '.*', $item['route'])) || request()->routeIs($item['route']); @endphp
                <a href="{{ route($item['route']) }}"
                   class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition {{ $active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white' }}">
                    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="{{ $item['icon'] }}"/>
                    </svg>
                    {{ $item['label'] }}
                </a>
            @endif
        @endforeach
    </nav>

    <div class="p-4 border-t border-slate-700">
        <div class="bg-slate-800 rounded-lg p-3 text-center">
            <div class="text-2xl mb-1">👷</div>
            <p class="text-xs text-slate-400">Gérez vos chantiers efficacement</p>
        </div>
    </div>
</aside>
