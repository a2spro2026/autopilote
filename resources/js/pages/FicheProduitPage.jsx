import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RotateCcw, Eye, Pencil, Trash2, Printer, FileText, X, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const UNIT_OPTIONS = ['', 'Kg', 'U', 'Sac', 'ML', 'M²', 'M³', 'Tn', 'M'];
const STATUT_OPTIONS = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
];
const ETAT_OPTIONS = [
    { value: 'Dispo', label: 'Dispo' },
    { value: 'Faible', label: 'Faible' },
    { value: 'Rupture', label: 'Rupture' },
];

const emptyForm = {
    reference: '',
    code_barre: '',
    name: '',
    categorie: '',
    famille: '',
    marque: '',
    unit: '',
    initial_stock: '',
    status: 'actif',
    etat: 'Rupture',
};

function Field({ label, children, className = '', compact = false }) {
    return (
        <div className={className}>
            <label className={`field-label ${compact ? 'field-label-compact' : ''}`}>
                {label}
            </label>
            {children}
        </div>
    );
}

const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-1.5 py-1 text-[11px] text-center outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy transition-all min-w-0';

function etatSelectClass(value) {
    const base = 'w-full rounded-lg border px-1.5 py-1 text-[11px] text-center font-semibold outline-none focus:ring-2 transition-all min-w-0 cursor-pointer appearance-none';
    switch (value) {
        case 'Dispo':
            return `${base} bg-emerald-50 border-emerald-300 text-emerald-700 focus:ring-emerald-400/40 focus:border-emerald-400 dark:bg-emerald-900/35 dark:border-emerald-600 dark:text-emerald-300`;
        case 'Faible':
            return `${base} bg-amber-50 border-amber-300 text-amber-700 focus:ring-amber-400/40 focus:border-amber-400 dark:bg-amber-900/35 dark:border-amber-600 dark:text-amber-300`;
        case 'Rupture':
            return `${base} bg-red-50 border-red-300 text-red-700 focus:ring-red-400/40 focus:border-red-400 dark:bg-red-900/35 dark:border-red-600 dark:text-red-300`;
        default:
            return inputClass;
    }
}

function EtatBadge({ value }) {
    const styles = {
        Dispo: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        Faible: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        Rupture: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${styles[value] || 'bg-slate-100 text-slate-600'}`}>
            {value || '—'}
        </span>
    );
}

function StatutBadge({ value }) {
    const actif = value === 'Actif' || value === 'actif';
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${actif ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {actif ? 'Actif' : 'Inactif'}
        </span>
    );
}

function buildFicheHtml(row) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Produit ${row.reference}</title>
<style>
body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}
h1{color:#1e3a5f;font-size:22px}
table{width:100%;border-collapse:collapse;margin-top:16px}
th,td{border:1px solid #e2e8f0;padding:10px;font-size:13px;text-align:center}
th{background:#f8fafc;font-weight:700;width:160px}
.badge{background:#ecfdf5;color:#059669;padding:4px 10px;border-radius:999px;font-weight:700}
</style></head><body>
<h1>Autopilote — Fiche Produit</h1>
<table>
<tr><th>Réf</th><td><span class="badge">${row.reference}</span></td></tr>
<tr><th>Cd Barre</th><td>${row.code_barre || '—'}</td></tr>
<tr><th>Désignation</th><td>${row.name || '—'}</td></tr>
<tr><th>Catégorie</th><td>${row.categorie || '—'}</td></tr>
<tr><th>Famille</th><td>${row.famille || '—'}</td></tr>
<tr><th>Marque</th><td>${row.marque || row.brand || '—'}</td></tr>
<tr><th>Unité</th><td>${row.unit || '—'}</td></tr>
<tr><th>Qté saisie</th><td>${row.initial_stock ?? 0}</td></tr>
<tr><th>Qté bons d'achat</th><td>${row.purchased_qty ?? 0}</td></tr>
<tr><th>Qté totale</th><td>${row.quantity_in_stock ?? row.initial_stock ?? 0}</td></tr>
<tr><th>Statut</th><td>${row.statut || '—'}</td></tr>
<tr><th>État</th><td>${row.etat || '—'}</td></tr>
</table></body></html>`;
}

function openPrintable(row) {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(buildFicheHtml(row));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

function ActionBtn({ title, onClick, icon: Icon, color = 'slate' }) {
    const colors = {
        blue: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
        amber: 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400',
        red: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        orange: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400',
    };

    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

function ViewModal({ row, onClose }) {
    if (!row) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700">
                    <div>
                        <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Fiche Produit</p>
                        <p className="text-white font-bold font-mono">{row.reference}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-3 text-sm">
                    {[
                        ['Cd Barre', row.code_barre],
                        ['Désignation', row.name],
                        ['Catégorie', row.categorie],
                        ['Famille', row.famille],
                        ['Marque', row.marque || row.brand],
                        ['Unité', row.unit],
                        ['Qté saisie', row.initial_stock ?? 0],
                        ["Qté bons d'achat", row.purchased_qty ?? 0],
                        ['Qté totale', row.quantity_in_stock ?? row.initial_stock],
                        ['Statut', row.statut],
                        ['État', row.etat],
                    ].map(([label, val]) => (
                        <div key={label} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-slate-500 text-xs uppercase">{label}</span>
                            <span className="font-medium text-slate-800 dark:text-white text-right">
                                {label === 'Statut' ? <StatutBadge value={val} /> : label === 'État' ? <EtatBadge value={val} /> : (val === 0 ? '0' : val || '—')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FicheProduitPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const readOnly = ['commercial', 'caisse'].includes(user?.role?.slug);
    const [form, setForm] = useState(emptyForm);
    const [rows, setRows] = useState([]);
    const [familles, setFamilles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [marques, setMarques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [viewRow, setViewRow] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        api.get('/products', { params: { all: 1, from_purchase: 1 } })
            .then((res) => {
                setRows(res.data.data ?? []);
                setFamilles(res.data.meta?.familles ?? []);
                setCategories(res.data.meta?.categories ?? []);
                setMarques(res.data.meta?.marques ?? []);
            })
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        load();
    };

    const cancelEdit = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
    };

    const fillForm = (row) => {
        setForm({
            reference: row.reference || '',
            code_barre: row.code_barre || '',
            name: row.name || '',
            categorie: row.categorie || '',
            famille: row.famille || '',
            marque: row.marque || row.brand || '',
            unit: row.unit || '',
            initial_stock: row.initial_stock ?? row.quantity_in_stock ?? '',
            status: row.status || 'actif',
            etat: row.etat || 'Rupture',
        });
        setEditingId(row.id);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Supprimer le produit « ${row.reference} — ${row.name} » ?`)) return;
        try {
            await api.delete(`/products/${row.id}`);
            if (editingId === row.id) resetForm();
            else load();
        } catch {
            setError('Impossible de supprimer ce produit');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        const payload = {
            reference: form.reference.trim(),
            code_barre: form.code_barre || null,
            name: form.name,
            categorie: form.categorie || null,
            famille: form.famille || null,
            brand: form.marque || null,
            unit: form.unit,
            initial_stock: parseFloat(form.initial_stock) || 0,
            status: form.status,
            etat: form.etat,
        };
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, payload);
                resetForm();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            <ViewModal row={viewRow} onClose={() => setViewRow(null)} />

            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">Fiche Produit</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Produits saisis dans les bons d&apos;achat
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={load} disabled={loading} className="btn-secondary text-sm" title="Actualiser">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">
                        <X className="w-4 h-4" />
                        Fermer
                    </button>
                </div>
            </div>

            {!readOnly && editingId && (
            <form onSubmit={handleSubmit} className="shrink-0 glass-card p-4 lg:p-5 shadow-card border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto">
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
                )}
                <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                    Mode modification — ID {editingId}
                </div>

                <div className="grid grid-cols-[0.65fr_1.15fr_1.2fr_1fr_1fr_1fr_0.55fr_0.55fr_0.55fr_0.55fr] gap-1.5 items-end w-full min-w-[1140px]">
                    <Field label="Réf" compact>
                        <input
                            type="text"
                            required
                            value={form.reference}
                            onChange={(e) => set('reference', e.target.value)}
                            placeholder="Réf"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Cd Barre" compact>
                        <input type="text" maxLength={32} value={form.code_barre} onChange={(e) => set('code_barre', e.target.value)} placeholder="Cd Barre" className={inputClass} />
                    </Field>
                    <Field label="Désignation">
                        <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Désignation" className={inputClass} />
                    </Field>
                    <Field label="Catégorie" compact>
                        <input type="text" list="categories-list" value={form.categorie} onChange={(e) => set('categorie', e.target.value)} placeholder="Catégorie" className={inputClass} />
                        <datalist id="categories-list">
                            {categories.map((c) => <option key={c} value={c} />)}
                        </datalist>
                    </Field>
                    <Field label="Famille" compact>
                        <input type="text" list="familles-list" value={form.famille} onChange={(e) => set('famille', e.target.value)} placeholder="Famille" className={inputClass} />
                        <datalist id="familles-list">
                            {familles.map((f) => <option key={f} value={f} />)}
                        </datalist>
                    </Field>
                    <Field label="Marque" compact>
                        <input type="text" list="marques-list" value={form.marque} onChange={(e) => set('marque', e.target.value)} placeholder="Marque" className={inputClass} />
                        <datalist id="marques-list">
                            {marques.map((m) => <option key={m} value={m} />)}
                        </datalist>
                    </Field>
                    <Field label="Unité" compact>
                        <select required value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputClass}>
                            {UNIT_OPTIONS.map((v) => <option key={v || 'e'} value={v}>{v || '—'}</option>)}
                        </select>
                    </Field>
                    <Field label="Qté" compact>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={form.initial_stock}
                            onChange={(e) => set('initial_stock', e.target.value)}
                            placeholder="0"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Statut" compact>
                        <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                            {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </Field>
                    <Field label="État" compact>
                        <select
                            value={form.etat}
                            onChange={(e) => set('etat', e.target.value)}
                            className={etatSelectClass(form.etat)}
                        >
                            {ETAT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value} className="bg-white text-slate-800 dark:bg-slate-800 dark:text-white">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" disabled={saving} className="btn-primary text-sm">
                        <Save className="w-4 h-4" />
                        {saving ? 'Enregistrement...' : 'Mettre à jour'}
                    </button>
                    <button type="button" onClick={cancelEdit} className="btn-secondary text-sm">
                        <RotateCcw className="w-4 h-4" />
                        Annuler
                    </button>
                </div>
            </form>
            )}

            <div className="flex-1 min-h-0 flex flex-col glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="shrink-0 px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Liste des produits (bons d&apos;achat)</h3>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-sm min-w-[1280px] border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {['Réf', 'Cd Barre', 'Désignation', 'Catégorie', 'Famille', 'Marque', 'Unité', 'Qté', 'Statut', 'État', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-center bg-slate-50 dark:bg-slate-800 shadow-[0_1px_0_0_rgba(226,232,240,1)] dark:shadow-[0_1px_0_0_rgba(51,65,85,1)]"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>{[...Array(11)].map((__, j) => (
                                        <td key={j} className="px-3 py-3 text-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" /></td>
                                    ))}</tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row) => (
                                    <tr key={row.id} className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors ${editingId === row.id ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}`}>
                                        <td className="px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-emerald-400">{row.reference}</td>
                                        <td className="px-3 py-2.5 text-center font-mono text-xs text-slate-600 dark:text-slate-300 min-w-[170px]">{row.code_barre || '—'}</td>
                                        <td className="px-3 py-2.5 text-center font-medium text-slate-800 dark:text-white max-w-[160px] truncate" title={row.name}>{row.name || '—'}</td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300 min-w-[130px] max-w-[160px] truncate" title={row.categorie}>{row.categorie || '—'}</td>
                                        <td className="px-3 py-2.5 text-center min-w-[130px]">
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={row.famille}>{row.famille || '—'}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300 min-w-[130px] max-w-[160px] truncate" title={row.marque || row.brand}>{row.marque || row.brand || '—'}</td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.unit || '—'}</td>
                                        <td
                                            className="px-3 py-2.5 text-center tabular-nums font-semibold text-brand-navy dark:text-emerald-400"
                                            title={`Saisie : ${Number(row.initial_stock ?? 0).toLocaleString('fr-FR')} + Bons d'achat : ${Number(row.purchased_qty ?? 0).toLocaleString('fr-FR')}`}
                                        >
                                            {Number(row.quantity_in_stock ?? row.initial_stock ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
                                        </td>
                                        <td className="px-3 py-2.5 text-center"><StatutBadge value={row.statut} /></td>
                                        <td className="px-3 py-2.5 text-center"><EtatBadge value={row.etat} /></td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <ActionBtn title="Voir" icon={Eye} color="blue" onClick={() => setViewRow(row)} />
                                                {!readOnly && (
                                                    <>
                                                        <ActionBtn title="Modifier" icon={Pencil} color="amber" onClick={() => fillForm(row)} />
                                                        <ActionBtn title="Supprimer" icon={Trash2} color="red" onClick={() => handleDelete(row)} />
                                                    </>
                                                )}
                                                <ActionBtn title="Imprimer" icon={Printer} color="slate" onClick={() => openPrintable(row)} />
                                                <ActionBtn title="PDF" icon={FileText} color="orange" onClick={() => openPrintable(row)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-400">Aucun produit issu des bons d&apos;achat</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
