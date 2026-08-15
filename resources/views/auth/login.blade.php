<x-guest-layout>
    <div class="mb-6 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white font-bold text-xl mb-3">SP</div>
        <h2 class="text-2xl font-bold text-slate-800">Autopilote</h2>
        <p class="text-sm text-slate-500 mt-1">Gestion commerciale</p>
    </div>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf
        <div>
            <x-input-label for="email" value="Email" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>
        <div class="mt-4">
            <x-input-label for="password" value="Mot de passe" />
            <x-text-input id="password" class="block mt-1 w-full" type="password" name="password" required />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>
        <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-blue-600" name="remember">
                <span class="ms-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
        </div>
        <div class="flex items-center justify-end mt-4">
            <x-primary-button class="bg-blue-600 hover:bg-blue-700">Connexion</x-primary-button>
        </div>
    </form>
</x-guest-layout>
