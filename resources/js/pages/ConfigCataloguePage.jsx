import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, X, ImagePlus, RefreshCw, SlidersHorizontal, Plus, Search } from 'lucide-react';
import api from '../lib/api';

const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange';

const emptyAddForm = {
    product_id: '',
    search: '',
    category: '',
    brand: '',
    description: '',
    price: '',
    photo: null,
};

function ActionBtn({ title, icon: Icon, color = 'slate', onClick }) {
    const colors = {
        amber: 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400',
        red: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
        orange: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400',
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    };
    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

export default function ConfigCataloguePage() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState(emptyAddForm);
    const [addPreview, setAddPreview] = useState(null);
    const [form, setForm] = useState({ category: '', brand: '', description: '', price: '', photo: null });
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.get('/catalog-products'),
            api.get('/products', { params: { all: 1 } }),
        ])
            .then(([catalogRes, productsRes]) => {
                setItems(catalogRes.data.data ?? []);
                setProducts(productsRes.data.data ?? []);
            })
            .catch(() => {
                setItems([]);
                setProducts([]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const catalogedIds = useMemo(
        () => new Set(items.map((i) => String(i.product_id))),
        [items],
    );

    const availableProducts = useMemo(() => {
        const q = addForm.search.trim().toLowerCase();
        return products
            .filter((p) => !catalogedIds.has(String(p.id)))
            .filter((p) => {
                if (!q) return true;
                return (
                    (p.reference || '').toLowerCase().includes(q)
                    || (p.article_id || '').toLowerCase().includes(q)
                    || (p.name || '').toLowerCase().includes(q)
                );
            })
            .slice(0, 12);
    }, [products, catalogedIds, addForm.search]);

    const selectedProduct = products.find((p) => String(p.id) === String(addForm.product_id));

    const openAdd = () => {
        setAddForm(emptyAddForm);
        if (addPreview) URL.revokeObjectURL(addPreview);
        setAddPreview(null);
        setError('');
        setAddOpen(true);
    };

    const closeAdd = () => {
        setAddOpen(false);
        setAddForm(emptyAddForm);
        if (addPreview) URL.revokeObjectURL(addPreview);
        setAddPreview(null);
        setError('');
    };

    const onAddPhotoChange = (file) => {
        setAddForm((f) => ({ ...f, photo: file || null }));
        if (addPreview) URL.revokeObjectURL(addPreview);
        setAddPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        if (!addForm.product_id) {
            setError('Sélectionnez une référence depuis la fiche produit');
            return;
        }
        setSaving(true);
        try {
            const data = new FormData();
            data.append('product_id', addForm.product_id);
            data.append('category', addForm.category || '');
            data.append('brand', addForm.brand || '');
            data.append('description', addForm.description || '');
            if (addForm.price !== '') data.append('price', addForm.price);
            if (addForm.photo) data.append('photo', addForm.photo);
            await api.post('/catalog-products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            closeAdd();
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible d\'ajouter au catalogue');
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            category: item.category || '',
            brand: item.brand || '',
            description: item.description || '',
            price: item.price != null ? String(item.price) : '',
            photo: null,
        });
        setPreview(item.photo_url || null);
        setError('');
    };

    const closeEdit = () => {
        setEditing(null);
        setForm({ category: '', brand: '', description: '', price: '', photo: null });
        setPreview(null);
        setError('');
    };

    const onPhotoChange = (file) => {
        setForm((f) => ({ ...f, photo: file || null }));
        if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : (editing?.photo_url || null));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        setError('');
        try {
            const data = new FormData();
            data.append('_method', 'PUT');
            data.append('category', form.category || '');
            data.append('brand', form.brand || '');
            data.append('description', form.description || '');
            data.append('price', form.price !== '' ? form.price : '');
            if (form.photo) data.append('photo', form.photo);

            await api.post(`/catalog-products/${editing.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            closeEdit();
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Modification impossible');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Retirer « ${item.name} » du catalogue ?`)) return;
        try {
            await api.delete(`/catalog-products/${item.id}`);
            if (editing?.id === item.id) closeEdit();
            load();
        } catch {
            setError('Suppression impossible');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-brand-orange" /> Config Catalogue
                    </h1>
                    <p className="text-sm text-slate-500">Ajouter, modifier photo, catégorie, marque, description et prix</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={openAdd} className="btn-primary text-sm">
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </button>
                    <button type="button" onClick={load} disabled={loading} className="btn-secondary text-sm" title="Actualiser">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>
            </div>

            {error && !editing && !addOpen && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm border border-red-100 dark:border-red-800">{error}</div>
            )}

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-zinc-900 via-orange-700 to-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Fiches catalogue</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                {['Photo', 'Réf', 'Désignation', 'Catégorie', 'Marque', 'Prix', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((__, j) => (
                                            <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : items.length ? (
                                items.map((row) => (
                                    <tr key={row.id} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/40">
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="mx-auto w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                {row.photo_url ? (
                                                    <img src={row.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImagePlus className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-mono text-xs font-semibold text-brand-orange">{row.reference || '—'}</td>
                                        <td className="px-4 py-2.5 text-center font-medium text-slate-800 dark:text-white max-w-[200px] truncate" title={row.name}>{row.name || '—'}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.category || '—'}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.brand || '—'}</td>
                                        <td className="px-4 py-2.5 text-center tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                                            {row.price != null && row.price !== ''
                                                ? `${Number(row.price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="inline-flex items-center gap-0.5">
                                                <ActionBtn title="Modifier" icon={Pencil} color="amber" onClick={() => openEdit(row)} />
                                                <ActionBtn title="Supprimer" icon={Trash2} color="red" onClick={() => handleDelete(row)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        Aucune fiche catalogue — cliquez sur Ajouter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {addOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={closeAdd}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[94vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-zinc-950 to-orange-700 shrink-0">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide">Ajouter au catalogue</h3>
                            <button type="button" onClick={closeAdd} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="flex-1 overflow-y-auto p-4 space-y-3">
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm border border-red-100 dark:border-red-800">{error}</div>
                            )}

                            <div>
                                <label className="field-label">Importer réf. fiche produit</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={addForm.search}
                                        onChange={(e) => setAddForm((f) => ({ ...f, search: e.target.value, product_id: '' }))}
                                        placeholder="Rechercher par réf ou désignation…"
                                        className={inputClass + ' pl-9'}
                                    />
                                </div>
                                {selectedProduct && (
                                    <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                        Sélectionné : {selectedProduct.reference} — {selectedProduct.name}
                                    </p>
                                )}
                                <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                                    {availableProducts.length ? availableProducts.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setAddForm((f) => ({
                                                ...f,
                                                product_id: String(p.id),
                                                search: `${p.reference} — ${p.name}`,
                                            }))}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-50 dark:hover:bg-slate-800 ${
                                                String(addForm.product_id) === String(p.id) ? 'bg-orange-50 dark:bg-orange-950/30' : ''
                                            }`}
                                        >
                                            <span className="font-mono font-semibold text-brand-orange">{p.reference}</span>
                                            <span className="text-slate-600 dark:text-slate-300"> — {p.name}</span>
                                        </button>
                                    )) : (
                                        <p className="px-3 py-4 text-center text-xs text-slate-400">
                                            Aucun produit disponible — créez-en d&apos;abord sur Fiche Produit
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="field-label">Catégorie</label>
                                    <input type="text" value={addForm.category} onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))} className={inputClass} />
                                </div>
                                <div>
                                    <label className="field-label">Marque</label>
                                    <input type="text" value={addForm.brand} onChange={(e) => setAddForm((f) => ({ ...f, brand: e.target.value }))} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="field-label">Description</label>
                                <textarea rows={3} value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} />
                            </div>

                            <div>
                                <label className="field-label">Prix (facultatif)</label>
                                <input type="number" step="0.01" min="0" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))} placeholder="—" className={inputClass} />
                            </div>

                            <div>
                                <label className="field-label">Photo du produit</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onAddPhotoChange(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 file:font-semibold"
                                />
                                {addPreview && (
                                    <img src={addPreview} alt="Aperçu" className="mt-2 h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                                )}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={closeAdd} className="btn-secondary text-sm flex-1">Annuler</button>
                                <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                                    {saving ? 'Enregistrement…' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={closeEdit}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[94vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-zinc-950 to-orange-700 shrink-0">
                            <div>
                                <p className="text-[10px] text-orange-200 uppercase tracking-wider">Modifier</p>
                                <h3 className="text-white font-bold text-sm">{editing.reference} — {editing.name}</h3>
                            </div>
                            <button type="button" onClick={closeEdit} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-3">
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm border border-red-100 dark:border-red-800">{error}</div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="field-label">Catégorie</label>
                                    <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass} />
                                </div>
                                <div>
                                    <label className="field-label">Marque</label>
                                    <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="field-label">Description</label>
                                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} />
                            </div>

                            <div>
                                <label className="field-label">Prix (facultatif)</label>
                                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="—" className={inputClass} />
                            </div>

                            <div>
                                <label className="field-label">Photo du produit</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onPhotoChange(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 file:font-semibold"
                                />
                                {preview && (
                                    <img src={preview} alt="Aperçu" className="mt-2 h-36 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                                )}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={closeEdit} className="btn-secondary text-sm flex-1">Fermer</button>
                                <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                                    {saving ? 'Enregistrement…' : 'Valider'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
