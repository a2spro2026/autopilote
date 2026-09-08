import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2, Eye, PauseCircle, Pencil, PlayCircle, Plus, Printer, Search, X, XCircle,
} from 'lucide-react';
import api from '../lib/api';

const CONTRACT_OPTIONS = ['', 'CDI', 'CDD', 'Journalier'];
const ECHEANCE_OPTIONS = ['', 'Jour', 'Semaine', '15jrs', 'Mois'];
const STATUS_OPTIONS = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Suspendu' },
];

const emptyFilters = { matricule: '', nom: '' };

const emptyForm = {
    hire_date: '',
    matricule: '',
    full_name: '',
    status: 'actif',
    contract_type: '',
    remuneration: '',
    echeance: '',
};

function Field({ label, children }) {
    return (
        <div className="min-w-0">
            <label className="field-label field-label-compact">{label}</label>
            {children}
        </div>
    );
}

const inputClass =
    'w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-brand-navy/30 focus:border-brand-navy';
const readOnlyClass =
    'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-1.5 text-xs text-center cursor-not-allowed';
const filterClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy';

function formatMontant(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ActionBtn({ title, onClick, icon: Icon, color = 'slate' }) {
    const colors = {
        blue: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
        amber: 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400',
        red: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
        green: 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    };
    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

function buildPrintHtml(row) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fiche ${row.matricule || ''}</title>
<style>
body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}
h1{color:#1e3a5f;font-size:22px;margin:0 0 8px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th,td{border:1px solid #e2e8f0;padding:10px;font-size:13px;text-align:left}
th{background:#f8fafc;width:180px;font-weight:700}
.badge{background:#fff7ed;color:#ea580c;padding:4px 10px;border-radius:999px;font-weight:700}
</style></head><body>
<h1>Autopilote — Fiche Personnel <span class="badge">${row.matricule || '—'}</span></h1>
<table>
<tr><th>Date</th><td>${row.hire_date || '—'}</td></tr>
<tr><th>ID</th><td>${row.matricule || '—'}</td></tr>
<tr><th>Nom Complet</th><td>${row.full_name || '—'}</td></tr>
<tr><th>Statut</th><td>${row.status_label || '—'}</td></tr>
<tr><th>Type contrat</th><td>${row.contract_type || '—'}</td></tr>
<tr><th>Rémunération</th><td>${formatMontant(row.remuneration)}</td></tr>
<tr><th>Échéance</th><td>${row.echeance || '—'}</td></tr>
</table>
</body></html>`;
}

function openPrintable(row) {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(buildPrintHtml(row));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

function ViewModal({ row, onClose }) {
    if (!row) return null;
    const fields = [
        ['Date', row.hire_date],
        ['ID', row.matricule],
        ['Nom Complet', row.full_name],
        ['Statut', row.status_label],
        ['Type contrat', row.contract_type],
        ['Rémunération', formatMontant(row.remuneration)],
        ['Échéance', row.echeance],
    ];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-navy to-blue-800">
                    <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider">Fiche Personnel</p>
                        <h3 className="text-white font-bold">{row.matricule}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-2 text-sm">
                    {fields.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 shrink-0">{label}</span>
                            <span className="font-medium text-slate-800 dark:text-white text-right">{value || '—'}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button type="button" onClick={() => openPrintable(row)} className="btn-secondary text-xs flex-1">
                        <Printer className="w-3.5 h-3.5" /> Imprimer
                    </button>
                    <button type="button" onClick={onClose} className="btn-danger text-xs flex-1">
                        <XCircle className="w-3.5 h-3.5" /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

const columns = ['Date', 'ID', 'Nom Complet', 'Statut', 'Type contrat', 'Rémunération', 'Échéance', 'Actions'];

export default function FichePersonnelPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(emptyFilters);
    const [applied, setApplied] = useState(emptyFilters);
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({ next_id: 'EMP-00001', date: '' });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewRow, setViewRow] = useState(null);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    const load = useCallback(() => {
        setLoading(true);
        const params = { all: 1 };
        if (applied.matricule) params.matricule = applied.matricule;
        if (applied.nom) params.nom = applied.nom;

        api.get('/employees', { params })
            .then((res) => {
                setRows(res.data.data ?? []);
                setMeta(res.data.meta ?? { next_id: 'EMP-00001', date: new Date().toISOString().slice(0, 10) });
            })
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, [applied]);

    useEffect(() => { load(); }, [load]);

    const openNew = () => {
        setEditingId(null);
        setError('');
        setForm({
            ...emptyForm,
            hire_date: meta.date || new Date().toISOString().slice(0, 10),
            matricule: meta.next_id || 'EMP-00001',
            status: 'actif',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closePanel = () => {
        setShowForm(false);
        setEditingId(null);
        setError('');
        setForm(emptyForm);
    };

    const fillForm = (row) => {
        setEditingId(row.id);
        setError('');
        setForm({
            hire_date: row.hire_date_raw || '',
            matricule: row.matricule || '',
            full_name: row.full_name || '',
            status: row.status || 'actif',
            contract_type: row.contract_type || '',
            remuneration: row.remuneration != null ? String(row.remuneration) : '',
            echeance: row.echeance || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.full_name?.trim()) {
            setError('Saisissez le nom complet');
            return;
        }
        setSaving(true);
        const payload = {
            hire_date: form.hire_date || undefined,
            matricule: form.matricule || undefined,
            full_name: form.full_name.trim(),
            status: form.status || 'actif',
            contract_type: form.contract_type || null,
            remuneration: parseFloat(String(form.remuneration).replace(',', '.')) || 0,
            echeance: form.echeance || null,
        };
        try {
            if (editingId) {
                await api.put(`/employees/${editingId}`, payload);
            } else {
                await api.post('/employees', payload);
            }
            closePanel();
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const handleSuspend = async (row) => {
        const action = row.status === 'actif' ? 'suspendre' : 'réactiver';
        if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} « ${row.full_name} » ?`)) return;
        try {
            await api.patch(`/employees/${row.id}/suspend`);
            load();
        } catch {
            setError('Impossible de modifier le statut');
        }
    };

    return (
        <div className="space-y-4">
            <ViewModal row={viewRow} onClose={() => setViewRow(null)} />

            <div className="flex flex-wrap items-center gap-2.5">
                {!showForm && (
                    <>
                        <button type="button" onClick={openNew} className="btn-primary">
                            <Plus className="w-4 h-4" /> Ajouter
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="btn-danger">
                            <XCircle className="w-4 h-4" /> Fermer
                        </button>
                    </>
                )}
            </div>

            {error && !showForm && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
                    )}
                    {editingId && (
                        <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                            Mode modification — Mettez à jour puis validez
                        </div>
                    )}

                    <div className="glass-card p-3 shadow-card border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 items-end min-w-[900px]">
                            <Field label="Date">
                                <input type="date" readOnly value={form.hire_date} className={readOnlyClass} />
                            </Field>
                            <Field label="ID">
                                <input type="text" readOnly value={form.matricule} className={readOnlyClass} />
                            </Field>
                            <Field label="Nom Complet">
                                <input type="text" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Nom complet" className={`${inputClass} text-left`} />
                            </Field>
                            <Field label="Statut">
                                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Type contrat">
                                <select value={form.contract_type} onChange={(e) => set('contract_type', e.target.value)} className={inputClass}>
                                    {CONTRACT_OPTIONS.map((v) => <option key={v || 'c'} value={v}>{v || '—'}</option>)}
                                </select>
                            </Field>
                            <Field label="Rémunération">
                                <input type="number" step="0.01" min="0" value={form.remuneration} onChange={(e) => set('remuneration', e.target.value)} placeholder="0.00" className={inputClass} />
                            </Field>
                            <Field label="Échéance">
                                <select value={form.echeance} onChange={(e) => set('echeance', e.target.value)} className={inputClass}>
                                    {ECHEANCE_OPTIONS.map((v) => <option key={v || 'e'} value={v}>{v || '—'}</option>)}
                                </select>
                            </Field>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button type="submit" disabled={saving} className="btn-primary">
                            <CheckCircle2 className="w-4 h-4" />
                            {saving ? 'Validation...' : 'Valider'}
                        </button>
                        <button type="button" onClick={closePanel} className="btn-danger">
                            <XCircle className="w-4 h-4" /> Fermer
                        </button>
                    </div>
                </form>
            )}

            {!showForm && (
                <>
                    <div className="glass-card p-4 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                        <div className="grid grid-cols-2 sm:grid-cols-[1fr_1.2fr_auto] gap-2.5 items-end">
                            <Field label="ID">
                                <input type="text" value={filters.matricule} onChange={(e) => setFilter('matricule', e.target.value)} placeholder="ID / Matricule..." className={filterClass} />
                            </Field>
                            <Field label="Nom">
                                <input type="text" value={filters.nom} onChange={(e) => setFilter('nom', e.target.value)} placeholder="Rechercher nom..." className={filterClass} />
                            </Field>
                            <button type="button" onClick={() => setApplied({ ...filters })} className="btn-secondary text-xs h-[34px] px-4 self-end">
                                <Search className="w-3.5 h-3.5" /> Rechercher
                            </button>
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                        <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-slate-900 border-b border-white/10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Fiche Personnel</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                        {columns.map((h) => (
                                            <th key={h} className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        [...Array(4)].map((_, i) => (
                                            <tr key={i}>{columns.map((__, j) => (
                                                <td key={j} className="px-3 py-3 text-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" /></td>
                                            ))}</tr>
                                        ))
                                    ) : rows.length ? (
                                        rows.map((row) => (
                                            <tr key={row.id} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.hire_date || '—'}</td>
                                                <td className="px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-orange-400">{row.matricule || '—'}</td>
                                                <td className="px-3 py-2.5 text-center font-medium text-slate-800 dark:text-white">{row.full_name || '—'}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                        row.status === 'actif'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                    }`}>
                                                        {row.status_label}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.contract_type || '—'}</td>
                                                <td className="px-3 py-2.5 text-center tabular-nums font-semibold text-brand-navy dark:text-orange-400">{formatMontant(row.remuneration)}</td>
                                                <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.echeance || '—'}</td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center justify-center gap-0.5">
                                                        <ActionBtn title="Voir" icon={Eye} color="blue" onClick={() => setViewRow(row)} />
                                                        <ActionBtn title="Modifier" icon={Pencil} color="amber" onClick={() => fillForm(row)} />
                                                        <ActionBtn
                                                            title={row.status === 'actif' ? 'Suspendre' : 'Réactiver'}
                                                            icon={row.status === 'actif' ? PauseCircle : PlayCircle}
                                                            color={row.status === 'actif' ? 'red' : 'green'}
                                                            onClick={() => handleSuspend(row)}
                                                        />
                                                        <ActionBtn title="Imprimer" icon={Printer} color="slate" onClick={() => openPrintable(row)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">Aucun personnel enregistré</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
