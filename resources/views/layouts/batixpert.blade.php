<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Tableau de bord') - Autopilote</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('styles')
</head>
<body class="font-sans antialiased bg-slate-100">
    <div class="flex min-h-screen">
        @include('layouts.partials.sidebar')

        <div class="flex-1 flex flex-col min-w-0">
            @include('layouts.partials.header')

            <main class="flex-1 p-6 overflow-auto">
                @if (session('success'))
                    <div class="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm">
                        {{ session('success') }}
                    </div>
                @endif
                @if (session('error'))
                    <div class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
                        {{ session('error') }}
                    </div>
                @endif

                @yield('content')
            </main>

            <footer class="bg-white border-t border-slate-200 px-6 py-4">
                <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                    <div class="flex flex-wrap gap-6">
                        <span>Gestion complète</span>
                        <span>Vision en temps réel</span>
                        <span>Productivité optimisée</span>
                        <span>Sécurité des données</span>
                    </div>
                    <div>© {{ date('Y') }} Autopilote - Tous droits réservés | Version 1.0.0</div>
                </div>
            </footer>
        </div>
    </div>
    @stack('scripts')
</body>
</html>
