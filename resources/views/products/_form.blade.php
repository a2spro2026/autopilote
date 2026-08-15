@php $p = $product ?? null; @endphp
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div><label class="field-label-form">Nom *</label><input type="text" name="name" value="{{ old('name', $p?->name) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Référence *</label><input type="text" name="reference" value="{{ old('reference', $p?->reference) }}" required class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Unité</label><input type="text" name="unit" value="{{ old('unit', $p?->unit ?? 'unité') }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Prix unitaire</label><input type="number" step="0.01" name="unit_price" value="{{ old('unit_price', $p?->unit_price ?? 0) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Quantité en stock</label><input type="number" step="0.001" name="quantity_in_stock" value="{{ old('quantity_in_stock', $p?->quantity_in_stock ?? 0) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Seuil d'alerte</label><input type="number" step="0.001" name="min_stock_alert" value="{{ old('min_stock_alert', $p?->min_stock_alert ?? 0) }}" class="w-full rounded-lg border-slate-300 text-sm"></div>
    <div><label class="field-label-form">Catégorie</label><select name="category_id" class="w-full rounded-lg border-slate-300 text-sm"><option value="">--</option>@foreach($categories as $cat)<option value="{{ $cat->id }}" @selected(old('category_id', $p?->category_id)==$cat->id)>{{ $cat->name }}</option>@endforeach</select></div>
    <div><label class="field-label-form">Statut</label><select name="status" class="w-full rounded-lg border-slate-300 text-sm"><option value="actif" @selected(old('status', $p?->status)==='actif')>Actif</option><option value="inactif" @selected(old('status', $p?->status)==='inactif')>Inactif</option></select></div>
</div>
