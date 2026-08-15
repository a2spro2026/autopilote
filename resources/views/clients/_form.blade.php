@php $client = $client ?? null; @endphp
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
        <input type="text" name="name" value="{{ old('name', $client?->name) }}" required class="w-full rounded-lg border-slate-300 text-sm">
        @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
    </div>
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Personne de contact</label>
        <input type="text" name="contact_person" value="{{ old('contact_person', $client?->contact_person) }}" class="w-full rounded-lg border-slate-300 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input type="email" name="email" value="{{ old('email', $client?->email) }}" class="w-full rounded-lg border-slate-300 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
        <input type="text" name="phone" value="{{ old('phone', $client?->phone) }}" class="w-full rounded-lg border-slate-300 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Ville</label>
        <input type="text" name="city" value="{{ old('city', $client?->city) }}" class="w-full rounded-lg border-slate-300 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">ICE</label>
        <input type="text" name="ice" value="{{ old('ice', $client?->ice) }}" class="w-full rounded-lg border-slate-300 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Statut</label>
        <select name="status" class="w-full rounded-lg border-slate-300 text-sm">
            <option value="actif" @selected(old('status', $client?->status) === 'actif')>Actif</option>
            <option value="inactif" @selected(old('status', $client?->status) === 'inactif')>Inactif</option>
        </select>
    </div>
    <div class="md:col-span-2">
        <label class="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
        <textarea name="address" rows="2" class="w-full rounded-lg border-slate-300 text-sm">{{ old('address', $client?->address) }}</textarea>
    </div>
</div>
