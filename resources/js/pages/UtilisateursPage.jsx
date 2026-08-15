import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Pencil, Trash2, Plus, XCircle, CheckCircle2, X, PauseCircle, PlayCircle,
} from 'lucide-react';
import api from '../lib/api';

const STATUT_OPTIONS = [
    { value: '', label: '— Sélectionner —' },
    { value: 'administrateur', label: 'Administrateur' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'caisse', label: 'Caisse' },
    { value: 'facturation', label: 'Facturation' },
];

const ETAT_OPTIONS = [
    { value: '1', label: 'Actif' },
    { value: '0', label: 'Suspendue' },
];

const emptyForm = {
    name: '',
    contact: '',
    statut: '',
    is_active: '1',
    login: '',
    password: '',
};

const inputClass =
    'w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-brand-navy/30 focus:border-brand-navy transition-all';
const readOnlyClass =
    'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-1.5 text-xs text-center cursor-not-allowed';

function Field({ label, children, className = '' }) {
    return (
        <div className={`min-w-0 ${className}`}>
            <label className="field-label field-label-compact">{label}</label>
            {children}
        </div>
    );
}

function ActionBtn({ title, onClick, icon: Icon, color = 'slate' }) {
    const colors = {
        blue: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
        amber: 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400',
        red: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
        orange: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400',
        emerald: 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    };

    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

function EtatBadge({ value }) {
    const actif = value === 'Actif' || value === true;
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
            actif
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
        }`}>
            {actif ? 'Actif' : 'Suspendue'}
        </span>
    );
}

function StatutBadge({ value }) {
    return (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {value || '—'}
        </span>
    );
}

function ViewModal({ row, onClose }) {
    if (!row) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-navy to-blue-800">
                    <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider">Utilisateur</p>
                        <p className="text-white font-bold font-mono">ID {row.id}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-3 text-sm">
                    {[
                        ['ID', row.id],
                        ['Nom Complet', row.name],
                        ['Contact', row.contact || row.phone],
                        ['Statut', row.statut],
                        ['État', row.etat],
                        ['Login', row.login || row.email],
                        ['Mot de Passe', row.password_mask || '••••••••'],
                    ].map(([label, val]) => (
                        <div key={label} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-slate-500 text-xs uppercase">{label}</span>
                            <span className="font-medium text-slate-800 dark:text-white text-right">
                                {label === 'État' ? <EtatBadge value={val} /> : label === 'Statut' ? <StatutBadge value={val} /> : (val || '—')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function UtilisateursPage() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({ next_id: '—' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [viewRow, setViewRow] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        api.get('/users', { params: { all: 1 } })
            .then((res) => {
                setRows(res.data.data ?? []);
                setMeta(res.data.meta ?? { next_id: '—' });
            })
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openEdit = (row) => {
        setForm({
            name: row.name || '',
            contact: row.contact || row.phone || '',
            statut: row.statut_slug || '',
            is_active: row.is_active ? '1' : '0',
            login: row.login || row.email || '',
            password: '',
        });
        setEditingId(row.id);
        setError('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setError('');
    };

    const handleClosePage = () => {
        closeForm();
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.statut) {
            setError('Veuillez sélectionner un statut.');
            return;
        }
        setSaving(true);

        const payload = {
            name: form.name.trim(),
            phone: form.contact.trim() || null,
            email: form.login.trim(),
            statut: form.statut,
            is_active: form.is_active === '1',
        };
        if (form.password) payload.password = form.password;

        try {
            if (editingId) {
                await api.put(`/users/${editingId}`, payload);
            } else {
                if (!form.password) {
                    setError('Le mot de passe est obligatoire');
                    setSaving(false);
                    return;
                }
                await api.post('/users', { ...payload, password: form.password });
            }
            closeForm();
            load();
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.errors?.statut?.[0]
                || err.response?.data?.errors?.email?.[0]
                || 'Erreur lors de l\'enregistrement';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Supprimer l'utilisateur « ${row.name} » ?`)) return;
        try {
            await api.delete(`/users/${row.id}`);
            if (editingId === row.id) closeForm();
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible de supprimer cet utilisateur');
        }
    };

    const handleSuspend = async (row) => {
        const action = row.is_active ? 'suspendre' : 'réactiver';
        if (!window.confirm(`Voulez-vous ${action} « ${row.name} » ?`)) return;
        try {
            await api.patch(`/users/${row.id}/suspend`);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Action impossible');
        }
    };

    const displayId = editingId ?? meta.next_id;

    return (
        <div className="space-y-4">
            <ViewModal row={viewRow} onClose={() => setViewRow(null)} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">Utilisateur</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configuration des comptes d&apos;accès</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={openCreate} className="btn-primary text-sm">
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </button>
                    <button type="button" onClick={handleClosePage} className="btn-danger text-sm">
                        <XCircle className="w-4 h-4" />
                        Fermer
                    </button>
                </div>
            </div>

            {error && !showForm && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card p-4 lg:p-5 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                    {error && (
                        <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
                    )}
                    {editingId && (
                        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                            Mode modification — ID {editingId}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2 items-end">
                        <Field label="ID">
                            <input type="text" readOnly value={displayId} className={readOnlyClass} />
                        </Field>
                        <Field label="Nom Complet" className="xl:col-span-2">
                            <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nom Complet" className={inputClass} />
                        </Field>
                        <Field label="Contact">
                            <input type="text" value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Téléphone" className={inputClass} />
                        </Field>
                        <Field label="Statut">
                            <select required value={form.statut} onChange={(e) => set('statut', e.target.value)} className={inputClass}>
                                {STATUT_OPTIONS.map((o) => <option key={o.value || 's'} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="État">
                            <select value={form.is_active} onChange={(e) => set('is_active', e.target.value)} className={inputClass}>
                                {ETAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Login">
                            <input type="email" required value={form.login} onChange={(e) => set('login', e.target.value)} placeholder="email@exemple.com" className={inputClass} />
                        </Field>
                        <Field label="Mot de Passe" className="xl:col-span-2 md:col-span-2">
                            <input
                                type="text"
                                required={!editingId}
                                value={form.password}
                                onChange={(e) => set('password', e.target.value)}
                                placeholder={editingId ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                                className={inputClass}
                                autoComplete="new-password"
                            />
                        </Field>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="submit" disabled={saving} className="btn-primary text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {saving ? 'Validation...' : 'Valider'}
                        </button>
                        <button type="button" onClick={closeForm} className="btn-danger text-sm">
                            <XCircle className="w-4 h-4" />
                            Fermer
                        </button>
                    </div>
                </form>
            )}

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-blue-900 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Tableau des utilisateurs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1080px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                {['ID', 'Nom Complet', 'Contact', 'Statut', 'État', 'Login', 'Mot de Passe', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>{[...Array(8)].map((__, j) => (
                                        <td key={j} className="px-4 py-3 text-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" /></td>
                                    ))}</tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row) => (
                                    <tr key={row.id} className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors ${editingId === row.id ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}`}>
                                        <td className="px-4 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-blue-300">{row.id}</td>
                                        <td className="px-4 py-2.5 text-center font-medium text-slate-800 dark:text-white">{row.name || '—'}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.contact || row.phone || '—'}</td>
                                        <td className="px-4 py-2.5 text-center"><StatutBadge value={row.statut} /></td>
                                        <td className="px-4 py-2.5 text-center"><EtatBadge value={row.etat} /></td>
                                        <td className="px-4 py-2.5 text-center text-slate-700 dark:text-slate-200">{row.login || row.email || '—'}</td>
                                        <td className="px-4 py-2.5 text-center font-mono text-xs tracking-widest text-slate-500">{row.password_mask || '••••••••'}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <ActionBtn title="Voir" icon={Eye} color="blue" onClick={() => setViewRow(row)} />
                                                <ActionBtn title="Modifier" icon={Pencil} color="amber" onClick={() => openEdit(row)} />
                                                <ActionBtn title="Supprimer" icon={Trash2} color="red" onClick={() => handleDelete(row)} />
                                                <ActionBtn
                                                    title={row.is_active ? 'Suspendre' : 'Réactiver'}
                                                    icon={row.is_active ? PauseCircle : PlayCircle}
                                                    color={row.is_active ? 'orange' : 'emerald'}
                                                    onClick={() => handleSuspend(row)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Aucun utilisateur</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
