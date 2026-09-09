import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, RotateCcw, Eye, Pencil, Trash2, Printer, FileText, X, RefreshCw,
    Search, Hash, Type, Layers, Award, Barcode,
} from 'lucide-react';
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

const MEMORY_KEY = 'autopilote_fiche_produit_search_memory';

const emptyFilters = {
    code: '',
    code_barre: '',
    barcode: '',
    famille: '',
    marque: '',
};

const FILTER_FIELDS = [
    { key: 'code', label: 'Code', icon: Hash, hint: 'Code produit' },
    { key: 'code_barre', label: 'Réf Equiv', icon: Type, hint: 'Réf équivalente' },
    { key: 'barcode', label: 'Code Barre', icon: Barcode, hint: 'Code-barres' },
    { key: 'famille', label: 'Famille', icon: Layers, hint: 'Famille' },
    { key: 'marque', label: 'Marque', icon: Award, hint: 'Marque' },
];

function readMemory() {
    try {
        return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}') || {};
    } catch {
        return {};
    }
}

function rememberValue(field, value) {
    const v = String(value || '').trim();
    if (!v) return;
    const data = readMemory();
    const prev = Array.isArray(data[field]) ? data[field] : [];
    data[field] = [v, ...prev.filter((x) => String(x).toLowerCase() !== v.toLowerCase())].slice(0, 40);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(data));
}

function uniqueSorted(values) {
    const map = new Map();
    values.forEach((v) => {
        const t = String(v || '').trim();
        if (!t) return;
        const k = t.toLowerCase();
        if (!map.has(k)) map.set(k, t);
    });
    return [...map.values()].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

function matchSuggestions(query, pool) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts = [];
    const contains = [];
    pool.forEach((v) => {
        const low = v.toLowerCase();
        if (low.startsWith(q)) starts.push(v);
        else if (low.includes(q)) contains.push(v);
    });
    return [...starts, ...contains].slice(0, 12);
}

function SearchSuggestInput({
    fieldKey,
    value,
    onChange,
    onRemember,
    suggestionsPool,
    placeholder,
}) {
    const [open, setOpen] = useState(false);
    const blurTimer = useRef(null);

    const suggestions = useMemo(
        () => matchSuggestions(value, suggestionsPool),
        [value, suggestionsPool],
    );

    useEffect(() => () => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
    }, []);

    const pick = (val) => {
        onChange(val);
        onRemember(fieldKey, val);
        setOpen(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                autoComplete="off"
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                    blurTimer.current = setTimeout(() => {
                        setOpen(false);
                        onRemember(fieldKey, value);
                    }, 150);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                    if (e.key === 'Enter' && suggestions[0]) {
                        e.preventDefault();
                        pick(suggestions[0]);
                    }
                }}
                placeholder={placeholder}
                className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            {open && value.trim() && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-0.5 max-h-40 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-xl">
                    {suggestions.map((opt) => (
                        <li key={opt}>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pick(opt)}
                                className="w-full px-2 py-1.5 text-left text-xs font-medium text-slate-800 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 truncate"
                            >
                                {opt}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const emptyForm = {
    reference: '',
    article_id: '',
    code_barre: '',
    barcode: '',
    name: '',
    categorie: '',
    famille: '',
    marque: '',
    unit: '',
    initial_stock: '',
    unit_price: '',
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

function productCode(row) {
    return row?.code || row?.article_id || row?.reference || '';
}

function refsEquivList(row) {
    if (Array.isArray(row?.refs_equiv) && row.refs_equiv.length) {
        return row.refs_equiv.map((r) => String(r).trim()).filter(Boolean);
    }
    const label = row?.refs_equiv_label || row?.code_barre || '';
    if (!label) return [];
    return [String(label).trim()].filter(Boolean);
}

function RefsEquivText({ refs, className = '' }) {
    if (!refs?.length) {
        return <span className={`text-slate-400 ${className}`}>—</span>;
    }
    return (
        <span className={`font-mono text-xs text-slate-700 dark:text-slate-200 ${className}`} title={refs.join(' · ')}>
            {refs.join(' · ')}
        </span>
    );
}

function buildFicheHtml(row) {
    const refs = refsEquivList(row);
    const refsHtml = refs.length ? refs.join(' · ') : '—';
    const code = productCode(row);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Produit ${code}</title>
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
<tr><th>Code</th><td><span class="badge">${code || '—'}</span></td></tr>
<tr><th>Réf Equiv</th><td>${refsHtml}</td></tr>
<tr><th>Code Barre</th><td>${row.barcode || '—'}</td></tr>
<tr><th>Désignation</th><td>${row.name || '—'}</td></tr>
<tr><th>Famille</th><td>${row.famille || '—'}</td></tr>
<tr><th>Marque</th><td>${row.marque || row.brand || '—'}</td></tr>
<tr><th>Quantité</th><td>${row.quantity_in_stock ?? row.initial_stock ?? 0}</td></tr>
<tr><th>U</th><td>${row.unit || '—'}</td></tr>
<tr><th>Prix/U</th><td>${row.unit_price ?? 0}</td></tr>
<tr><th>Qté saisie</th><td>${row.initial_stock ?? 0}</td></tr>
<tr><th>Qté bons d'achat</th><td>${row.purchased_qty ?? 0}</td></tr>
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
    const refs = refsEquivList(row);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700">
                    <div>
                        <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Fiche Produit</p>
                        <p className="text-white font-bold font-mono">{productCode(row)}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 text-xs uppercase shrink-0">Code</span>
                        <span className="font-medium text-slate-800 dark:text-white text-right font-mono">{productCode(row) || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 text-xs uppercase shrink-0">Réf Equiv</span>
                        <RefsEquivText refs={refs} className="text-right" />
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 text-xs uppercase shrink-0">Code Barre</span>
                        <span className="font-medium text-slate-800 dark:text-white text-right font-mono">{row.barcode || '—'}</span>
                    </div>
                    {[
                        ['Désignation', row.name],
                        ['Famille', row.famille],
                        ['Marque', row.marque || row.brand],
                        ['Quantité', row.quantity_in_stock ?? row.initial_stock],
                        ['U', row.unit],
                        ['Prix/U', row.unit_price],
                        ['Qté saisie', row.initial_stock ?? 0],
                        ["Qté bons d'achat", row.purchased_qty ?? 0],
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
    const [marques, setMarques] = useState([]);
    const [filters, setFilters] = useState(emptyFilters);
    const [memory, setMemory] = useState(() => readMemory());
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
                setMarques(res.data.meta?.marques ?? []);
            })
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRemember = useCallback((field, value) => {
        rememberValue(field, value);
        setMemory(readMemory());
    }, []);

    const suggestionPools = useMemo(() => ({
        code: uniqueSorted([
            ...(memory.code || []),
            ...rows.map((r) => r.code || r.article_id || r.reference),
        ]),
        code_barre: uniqueSorted([
            ...(memory.code_barre || []),
            ...rows.flatMap((r) => refsEquivList(r)),
        ]),
        barcode: uniqueSorted([
            ...(memory.barcode || []),
            ...rows.map((r) => r.barcode),
        ]),
        famille: uniqueSorted([...(memory.famille || []), ...familles, ...rows.map((r) => r.famille)]),
        marque: uniqueSorted([
            ...(memory.marque || []),
            ...marques,
            ...rows.map((r) => r.marque || r.brand),
        ]),
    }), [rows, familles, marques, memory]);

    const filteredRows = useMemo(() => {
        const codeQ = filters.code.trim().toLowerCase();
        const refQ = filters.code_barre.trim().toLowerCase();
        const barcodeQ = filters.barcode.trim().toLowerCase();
        const famQ = filters.famille.trim().toLowerCase();
        const brandQ = filters.marque.trim().toLowerCase();

        return rows.filter((row) => {
            if (codeQ) {
                const code = productCode(row).toLowerCase();
                if (!code.includes(codeQ)) return false;
            }
            if (refQ) {
                const refs = refsEquivList(row).join(' ').toLowerCase();
                const single = String(row.code_barre || '').toLowerCase();
                if (!refs.includes(refQ) && !single.includes(refQ)) return false;
            }
            if (barcodeQ && !String(row.barcode || '').toLowerCase().includes(barcodeQ)) return false;
            if (famQ && !(row.famille || '').toLowerCase().includes(famQ)) return false;
            if (brandQ && !(`${row.marque || ''} ${row.brand || ''}`).toLowerCase().includes(brandQ)) return false;
            return true;
        });
    }, [rows, filters]);

    const hasActiveFilters = Object.values(filters).some((v) => String(v).trim() !== '');

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
            article_id: row.article_id || row.code || row.reference || '',
            code_barre: row.code_barre || '',
            barcode: row.barcode || '',
            name: row.name || '',
            categorie: row.categorie || '',
            famille: row.famille || '',
            marque: row.marque || row.brand || '',
            unit: row.unit || '',
            initial_stock: row.initial_stock ?? row.quantity_in_stock ?? '',
            unit_price: row.unit_price != null ? String(row.unit_price) : '',
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
            article_id: form.article_id.trim() || form.reference.trim(),
            code_barre: form.code_barre || null,
            barcode: form.barcode || null,
            name: form.name,
            categorie: form.categorie || null,
            famille: form.famille || null,
            brand: form.marque || null,
            unit: form.unit,
            initial_stock: parseFloat(form.initial_stock) || 0,
            unit_price: parseFloat(String(form.unit_price).replace(',', '.')) || 0,
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
        <div className="flex flex-col gap-4">
            <ViewModal row={viewRow} onClose={() => setViewRow(null)} />

            <div className="flex flex-wrap items-center justify-between gap-3">
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

            <div className="relative z-20 glass-card overflow-visible shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 truncate">
                            Recherche
                        </span>
                    </div>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => setFilters(emptyFilters)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-3 overflow-visible">
                    {FILTER_FIELDS.map(({ key, label, icon: Icon, hint }) => (
                        <div key={key} className="min-w-0">
                            <label className="flex items-center gap-1 mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <Icon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                {label}
                            </label>
                            <SearchSuggestInput
                                fieldKey={key}
                                value={filters[key]}
                                onChange={(val) => setFilters((f) => ({ ...f, [key]: val }))}
                                onRemember={handleRemember}
                                suggestionsPool={suggestionPools[key] || []}
                                placeholder={hint}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {!readOnly && editingId && (
            <form onSubmit={handleSubmit} className="glass-card p-4 lg:p-5 shadow-card border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto">
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
                )}
                <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                    Mode modification — ID {editingId}
                </div>

                <div className="grid grid-cols-[0.55fr_0.85fr_1.3fr_1.25fr_0.9fr_0.9fr_0.65fr_0.4fr_0.7fr_0.5fr_0.5fr] gap-1.5 items-end w-full min-w-[1320px]">
                    <Field label="Code" compact>
                        <input
                            type="text"
                            required
                            value={form.article_id}
                            onChange={(e) => set('article_id', e.target.value)}
                            placeholder="Code"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Réf Equiv" compact>
                        <input
                            type="text"
                            maxLength={100}
                            value={form.code_barre}
                            onChange={(e) => set('code_barre', e.target.value)}
                            placeholder="Réf Equiv"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Code Barre" compact>
                        <input
                            type="text"
                            maxLength={100}
                            value={form.barcode}
                            onChange={(e) => set('barcode', e.target.value)}
                            placeholder="Code Barre"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Désignation" compact>
                        <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Désignation" className={inputClass} />
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
                    <Field label="Quantité" compact>
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
                    <Field label="U" compact>
                        <select required value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputClass}>
                            {UNIT_OPTIONS.map((v) => <option key={v || 'e'} value={v}>{v || '—'}</option>)}
                        </select>
                    </Field>
                    <Field label="Prix/U" compact>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.unit_price}
                            onChange={(e) => set('unit_price', e.target.value)}
                            placeholder="0.00"
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

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Liste des produits (bons d&apos;achat)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1360px] border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {['Code', 'Réf Equiv', 'Code Barre', 'Désignation', 'Famille', 'Marque', 'Quantité', 'U', 'Prix/U', 'Statut', 'État', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-center bg-slate-50 dark:bg-slate-800"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>{[...Array(12)].map((__, j) => (
                                        <td key={j} className="px-3 py-3 text-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" /></td>
                                    ))}</tr>
                                ))
                            ) : filteredRows.length ? (
                                filteredRows.map((row) => (
                                    <tr key={row.id} className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors ${editingId === row.id ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}`}>
                                        <td className="px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-emerald-400 w-[78px]">{productCode(row)}</td>
                                        <td className="px-3 py-2.5 text-center min-w-[90px] max-w-[110px]">
                                            <RefsEquivText refs={refsEquivList(row)} />
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-mono text-xs text-slate-600 dark:text-slate-300 min-w-[145px]" title={row.barcode || ''}>
                                            {row.barcode || '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-medium text-slate-800 dark:text-white min-w-[150px] max-w-[220px]" title={row.name}>{row.name || '—'}</td>
                                        <td className="px-3 py-2.5 text-center min-w-[120px]">
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={row.famille}>{row.famille || '—'}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300 min-w-[120px] max-w-[160px] truncate" title={row.marque || row.brand}>{row.marque || row.brand || '—'}</td>
                                        <td
                                            className="px-3 py-2.5 text-center tabular-nums font-semibold text-brand-navy dark:text-emerald-400"
                                            title={`Saisie : ${Number(row.initial_stock ?? 0).toLocaleString('fr-FR')} + Bons d'achat : ${Number(row.purchased_qty ?? 0).toLocaleString('fr-FR')}`}
                                        >
                                            {Number(row.quantity_in_stock ?? row.initial_stock ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.unit || '—'}</td>
                                        <td className="px-3 py-2.5 text-center tabular-nums text-slate-700 dark:text-slate-200">
                                            {Number(row.unit_price ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                <tr>
                                    <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                                        {rows.length ? 'Aucun résultat pour ces filtres' : 'Aucun produit issu des bons d\'achat'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
