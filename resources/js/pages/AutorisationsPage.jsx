import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

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

export default function AutorisationsPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [sections, setSections] = useState([]);
    const [userId, setUserId] = useState('');
    const [statut, setStatut] = useState('—');
    const [checked, setChecked] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [loadingUser, setLoadingUser] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadMeta = useCallback(() => {
        setLoading(true);
        api.get('/authorizations/meta')
            .then((res) => {
                setUsers(res.data.users ?? []);
                setSections(res.data.sections ?? []);
            })
            .catch(() => {
                setUsers([]);
                setSections([]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadMeta(); }, [loadMeta]);

    const selectedUser = useMemo(
        () => users.find((u) => String(u.id) === String(userId)),
        [users, userId],
    );

    const loadUserAccess = async (id) => {
        if (!id) {
            setStatut('—');
            setChecked(new Set());
            return;
        }
        setLoadingUser(true);
        setError('');
        try {
            const { data } = await api.get(`/authorizations/${id}`);
            setStatut(data.user?.statut || '—');
            setChecked(new Set(data.menu_access ?? []));
        } catch {
            setError('Impossible de charger les autorisations');
            setChecked(new Set());
        } finally {
            setLoadingUser(false);
        }
    };

    const handleUserChange = (id) => {
        setUserId(id);
        const u = users.find((x) => String(x.id) === String(id));
        setStatut(u?.statut || '—');
        loadUserAccess(id);
    };

    const toggleKey = (key) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleSection = (section) => {
        const childKeys = (section.children || []).map((c) => c.key);
        const allKeys = [section.key, ...childKeys];
        setChecked((prev) => {
            const next = new Set(prev);
            const allOn = allKeys.every((k) => next.has(k));
            if (allOn) {
                allKeys.forEach((k) => next.delete(k));
            } else {
                allKeys.forEach((k) => next.add(k));
            }
            return next;
        });
    };

    const sectionState = (section) => {
        const childKeys = (section.children || []).map((c) => c.key);
        const keys = [section.key, ...childKeys];
        const on = keys.filter((k) => checked.has(k)).length;
        if (on === 0) return false;
        if (on === keys.length) return true;
        return 'indeterminate';
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        setError('');
        if (!userId) {
            setError('Veuillez sélectionner un utilisateur.');
            return;
        }
        setSaving(true);
        try {
            await api.put(`/authorizations/${userId}`, {
                menu_access: Array.from(checked),
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => navigate('/');

    const ActionButtons = ({ className = '' }) => (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !userId}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? 'Validation...' : 'Valider'}
            </button>
            <button type="button" onClick={handleClose} className="btn-danger text-sm">
                <XCircle className="w-4 h-4" />
                Fermer
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-brand-navy dark:text-blue-300" />
                        Autorisation
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Accès aux sections et sous-menus</p>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">{error}</div>
            )}

            <div className="glass-card p-4 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-end">
                    <Field label="ID">
                        <input type="text" readOnly value={selectedUser?.id ?? '—'} className={readOnlyClass} />
                    </Field>
                    <Field label="Nom Complet">
                        <select
                            value={userId}
                            onChange={(e) => handleUserChange(e.target.value)}
                            className={inputClass}
                            disabled={loading}
                        >
                            <option value="">— Sélectionner —</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Statut Auto" className="col-span-2 md:col-span-1">
                        <input type="text" readOnly value={statut} className={readOnlyClass} />
                    </Field>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-blue-900 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Tableau des autorisations</h3>
                </div>

                <div className={`overflow-x-auto ${loadingUser ? 'opacity-50 pointer-events-none' : ''}`}>
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left w-[220px]">Section</th>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">Sous-menus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {!userId ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-12 text-center text-slate-400">
                                        Sélectionnez un utilisateur pour gérer ses accès
                                    </td>
                                </tr>
                            ) : loading && !sections.length ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse max-w-[120px]" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse max-w-[280px]" /></td>
                                    </tr>
                                ))
                            ) : (
                                sections.map((section) => {
                                    const state = sectionState(section);
                                    return (
                                        <tr key={section.key} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 align-top">
                                            <td className="px-4 py-3">
                                                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={state === true}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = state === 'indeterminate';
                                                        }}
                                                        onChange={() => toggleSection(section)}
                                                        className="w-4 h-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy/30"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                                                        {section.label}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="px-4 py-3">
                                                {section.children?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                        {section.children.map((child) => (
                                                            <label
                                                                key={child.key}
                                                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked.has(child.key)}
                                                                    onChange={() => toggleKey(child.key)}
                                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-brand-navy focus:ring-brand-navy/30"
                                                                />
                                                                <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                                    {child.label}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Accès direct</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {userId ? `${checked.size} accès sélectionné(s)` : 'Aucun utilisateur sélectionné'}
                    </p>
                    <ActionButtons />
                </div>
            </div>
        </div>
    );
}
