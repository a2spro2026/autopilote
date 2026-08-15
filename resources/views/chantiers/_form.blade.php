@php $c = $chantier ?? null; @endphp
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div><label class="field-label-form">Client *</label><select name="client_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($clients as $client)<option value="{{ $client->id }}" @selected(old('client_id', $c?->client_id)==$client->id)>{{ $client->name }}</option>@endforeach</select></div>
    <div><label class="field-label-form">Référence *</label><input type="text" name="reference" value="{{ old('reference', $c?->reference) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div class="md:col-span-2"><label class="field-label-form">Nom *</label><input type="text" name="name" value="{{ old('name', $c?->name) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Ville</label><input type="text" name="city" value="{{ old('city', $c?->city) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Budget</label><input type="number" step="0.01" name="budget" value="{{ old('budget', $c?->budget ?? 0) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Date début</label><input type="date" name="start_date" value="{{ old('start_date', $c?->start_date?->format('Y-m-d')) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Date fin</label><input type="date" name="end_date" value="{{ old('end_date', $c?->end_date?->format('Y-m-d')) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Statut</label><select name="status" class="w-full rounded-lg border-slate-300 text-sm">@foreach(['planifie','en_cours','suspendu','termine','annule'] as $s)<option value="{{ $s }}" @selected(old('status', $c?->status)===$s)>{{ ucfirst(str_replace('_',' ',$s)) }}</option>@endforeach</select></div>
    <div><label class="field-label-form">Progression (%)</label><input type="number" name="progress" min="0" max="100" value="{{ old('progress', $c?->progress ?? 0) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Chef de chantier</label><select name="manager_id" class="w-full rounded-lg border-slate-300 text-sm"><option value="">--</option>@foreach($managers as $m)<option value="{{ $m->id }}" @selected(old('manager_id', $c?->manager_id)==$m->id)>{{ $m->name }}</option>@endforeach</select></div>
    <div class="md:col-span-2"><label class="field-label-form">Adresse</label><textarea name="address" rows="2" class="w-full rounded-lg border-slate-300 text-sm">{{ old('address', $c?->address) }}</textarea></div>
</div>
