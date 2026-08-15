@php $s = $supplier ?? null; @endphp
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div><label class="field-label-form">Nom *</label><input type="text" name="name" value="{{ old('name', $s?->name) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Contact</label><input type="text" name="contact_person" value="{{ old('contact_person', $s?->contact_person) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Email</label><input type="email" name="email" value="{{ old('email', $s?->email) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Téléphone</label><input type="text" name="phone" value="{{ old('phone', $s?->phone) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Ville</label><input type="text" name="city" value="{{ old('city', $s?->city) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Conditions paiement</label><input type="text" name="payment_terms" value="{{ old('payment_terms', $s?->payment_terms) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Statut</label><select name="status" class="w-full rounded-lg border-slate-300 text-sm"><option value="actif" @selected(old('status', $s?->status)==='actif')>Actif</option><option value="inactif" @selected(old('status', $s?->status)==='inactif')>Inactif</option></select></div>
</div>
