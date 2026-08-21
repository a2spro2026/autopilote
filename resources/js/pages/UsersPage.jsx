import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Eye, Pencil, Trash2, RefreshCw, X, UserCog, PauseCircle, PlayCircle, Ban, Lock, User,
} from 'lucide-react';
import api from '../lib/api';

const STATUT_OPTIONS = [
    { value: 'Gerant', label: 'Gérant' },
    { value: 'Assistant', label: 'Assistant(e)' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Facturation', label: 'Facturation' },
];

const emptyForm = {
    name: '',
    phone: '',
    statut: '',
    login: '',
    password: '',
};

const columns = ['Date', 'ID', 'Nom Complet', 'Contact', 'Statut', 'Login', 'Mot de Passe', 'Actions'];

function Field({ label, children, required = false }) {
    return (
        <div className="min-w-0">
            <label className="field-label field-label-compact">
                {label}{required ? ' *' : ''}
            </label>
            {children}
        </div>
    );
}

const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-2 text-xs text-center outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all';
const readOnlyClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2.5 py-2 text-xs text-center cursor-not-allowed';

function ActionBtn({ title, icon: Icon, color = 'slate', onClick }) {
    const colors = {
        blue: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30 dark:hover:text-orange-400',
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

function ViewModal({ row, onClose }) {
    if (!row) return null;
    const fields = [
        ['Date', row.date],
        ['ID', row.id],
        ['Nom Complet', row.name],
        ['Contact', row.contact || row.phone],
        ['Statut', row.statut_label || row.statut],
        ['Login', row.login],
        ['Mot de Passe', row.password_mask || '••••••••'],
        ['État', row.is_active ? 'Actif' : 'Suspendu'],
    ];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-700 via-slate-800 to-brand-navy">
                    <div>
                        <p className="text-[10px] text-slate-300 uppercase tracking-wider">Utilisateur</p>
                        <h3 className="text-white font-bold">{row.name}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3 text-sm">
                    {fields.map(([label, value]) => (
                        <div key={label}>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{value || '—'}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button type="button" onClick={onClose} className="btn-secondary text-xs px-4">Fermer</button>
                </div>
            </div>
        </div>
    );
}

function FormModal({ open, form, nextId, editingId, saving, error, onChange, onClose, onSubmit }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-700 via-slate-800 to-brand-navy">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                        {editingId ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
                    </h3>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4" autoComplete="off">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Identité</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Field label="ID">
                                <input type="text" readOnly value={editingId || nextId || '—'} className={readOnlyClass} />
                            </Field>
                            <Field label="Nom Complet" required>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => onChange('name', e.target.value)}
                                    placeholder="Nom complet"
                                    autoComplete="off"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Contact">
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => onChange('phone', e.target.value)}
                                    placeholder="Téléphone"
                                    autoComplete="off"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Statut" required>
                                <select
                                    required
                                    value={form.statut}
                                    onChange={(e) => onChange('statut', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="" disabled>Sélectionner</option>
                                    {STATUT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20 p-4 space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Panneau de connexion
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Login" required>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        name="user-login-new"
                                        autoComplete="off"
                                        value={form.login}
                                        onChange={(e) => onChange('login', e.target.value)}
                                        placeholder="Login"
                                        className={`${inputClass} pl-8`}
                                    />
                                </div>
                            </Field>
                            <Field label="Mot de Passe" required={!editingId}>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="password"
                                        required={!editingId}
                                        name="user-password-new"
                                        autoComplete="new-password"
                                        value={form.password}
                                        onChange={(e) => onChange('password', e.target.value)}
                                        placeholder={editingId ? 'Laisser vide pour conserver' : 'Mot de passe'}
                                        className={`${inputClass} pl-8`}
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="btn-secondary text-xs px-4">
                            Fermer
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary text-xs px-4">
                            {saving ? '...' : 'Valider'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UsersPage() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [viewRow, setViewRow] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        api.get('/users')
            .then((res) => {
                setRows(res.data.data ?? []);
                setNextId(res.data.meta?.next_id ?? 1);
            })
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError('');
        setFormOpen(true);
    };

    const openEdit = (row) => {
        setEditingId(row.id);
        setForm({
            name: row.name || '',
            phone: row.phone || row.contact || '',
            statut: row.statut || '',
            login: row.login || '',
            password: '',
        });
        setError('');
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditingId(null);
        setForm(emptyForm);
        setError('');
    };

    const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: form.name,
                phone: form.phone || null,
                statut: form.statut,
                login: form.login,
            };
            if (form.password) payload.password = form.password;

            if (editingId) {
                await api.put(`/users/${editingId}`, payload);
            } else {
                await api.post('/users', { ...payload, password: form.password });
            }
            closeForm();
            load();
        } catch (err) {
            const msg = err.response?.data?.message
                || Object.values(err.response?.data?.errors || {}).flat()?.[0]
                || 'Enregistrement impossible';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const onSuspend = async (row) => {
        const action = row.is_active ? 'suspendre' : 'réactiver';
        if (!window.confirm(`Voulez-vous ${action} « ${row.name} » ?`)) return;
        try {
            await api.patch(`/users/${row.id}/suspend`);
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Action impossible');
        }
    };

    const onDelete = async (row) => {
        if (!window.confirm(`Supprimer l'utilisateur « ${row.name} » ?`)) return;
        try {
            await api.delete(`/users/${row.id}`);
            if (editingId === row.id) closeForm();
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Suppression impossible');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-brand-navy" /> Utilisateur
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configuration des comptes d&apos;accès au système</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={openCreate} className="btn-primary text-xs px-4">
                        <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary text-xs px-4">
                        Fermer
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-slate-700 via-slate-800 to-brand-navy border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Tableau Utilisateurs</h3>
                    <button type="button" onClick={load} disabled={loading} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Actualiser">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-100 via-slate-200/90 to-slate-100 dark:from-slate-800 dark:via-slate-700/80 dark:to-slate-800 border-b-2 border-slate-300 dark:border-slate-600">
                                {columns.map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300 whitespace-nowrap text-center"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>
                                        {columns.map((__, j) => (
                                            <td key={j} className="px-4 py-3 text-center">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${!row.is_active ? 'opacity-60' : ''}`}
                                    >
                                        <td className="px-4 py-2.5 text-center text-xs text-slate-500 dark:text-slate-400">{row.date || '—'}</td>
                                        <td className="px-4 py-2.5 text-center tabular-nums font-semibold text-slate-700 dark:text-slate-200">{row.id}</td>
                                        <td className="px-4 py-2.5 text-center font-medium text-slate-800 dark:text-white">{row.name}</td>
                                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.contact || row.phone || '—'}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                {row.statut_label || row.statut || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-mono text-xs text-brand-navy dark:text-violet-300">{row.login}</td>
                                        <td className="px-4 py-2.5 text-center tracking-widest text-slate-400">{row.password_mask || '••••••••'}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="inline-flex items-center justify-center gap-0.5">
                                                <ActionBtn title="Voir" icon={Eye} color="orange" onClick={() => setViewRow(row)} />
                                                <ActionBtn title="Modifier" icon={Pencil} color="amber" onClick={() => openEdit(row)} />
                                                <ActionBtn title="Supprimer" icon={Trash2} color="red" onClick={() => onDelete(row)} />
                                                <ActionBtn
                                                    title={row.is_active ? 'Suspendre' : 'Réactiver'}
                                                    icon={row.is_active ? PauseCircle : PlayCircle}
                                                    color={row.is_active ? 'orange' : 'emerald'}
                                                    onClick={() => onSuspend(row)}
                                                />
                                            </div>
                                            {!row.is_active && (
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-red-500">
                                                        <Ban className="w-3 h-3" /> Suspendu
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        Aucun utilisateur — cliquez sur Ajouter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FormModal
                open={formOpen}
                form={form}
                nextId={nextId}
                editingId={editingId}
                saving={saving}
                error={error}
                onChange={onChange}
                onClose={closeForm}
                onSubmit={onSubmit}
            />

            <ViewModal row={viewRow} onClose={() => setViewRow(null)} />
        </div>
    );
}
