@php $u = $user ?? null; @endphp
<div class="space-y-4">
    <div><label class="field-label-form">Nom *</label><input type="text" name="name" value="{{ old('name', $u?->name) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Email *</label><input type="email" name="email" value="{{ old('email', $u?->email) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Mot de passe {{ $u ? '(laisser vide pour ne pas changer)' : '*' }}</label><input type="password" name="password" {{ $u ? '' : 'required' }} class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Confirmer mot de passe</label><input type="password" name="password_confirmation" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Rôle *</label><select name="role_id" required class="w-full rounded-lg border-slate-300 text-sm">@foreach($roles as $role)<option value="{{ $role->id }}" @selected(old('role_id', $u?->role_id)==$role->id)>{{ $role->name }}</option>@endforeach</select></div>
    <div><label class="field-label-form">Téléphone</label><input type="text" name="phone" value="{{ old('phone', $u?->phone) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div class="flex items-center gap-2"><input type="checkbox" name="is_active" value="1" @checked(old('is_active', $u?->is_active ?? true)) class="rounded border-slate-300"><label class="text-sm">Compte actif</label></div>
</div>
