import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Scale, Plus, Trash2, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import api from '../../lib/api';

function formatMontant(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatStock(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 });
}

function productStock(product) {
    return Number(product?.quantity_in_stock ?? product?.stock ?? product?.initial_stock ?? 0) || 0;
}

function todayRaw() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayLabel() {
    return new Date().toLocaleDateString('fr-FR');
}

function SummaryCard({ label, value, gradient, glow, icon: Icon, loading }) {
    return (
        <div
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
            style={{ boxShadow: `0 10px 28px -8px ${glow}` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/25" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/85">{label}</p>
                    <p className="mt-1.5 text-lg sm:text-xl font-bold tabular-nums leading-tight">
                        {loading ? '…' : formatMontant(value)}
                    </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function CommercialKpis() {
    const [summary, setSummary] = useState({ total_ventes: 0, solde_total: 0 });
    const [loadingKpis, setLoadingKpis] = useState(true);

    useEffect(() => {
        api.get('/client-orders/balance')
            .then((res) => {
                setSummary({
                    total_ventes: Number(res.data.meta?.total_ventes) || 0,
                    solde_total: Number(res.data.meta?.solde_total) || 0,
                });
            })
            .catch(() => setSummary({ total_ventes: 0, solde_total: 0 }))
            .finally(() => setLoadingKpis(false));
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            <SummaryCard
                label="Total Ventes"
                value={summary.total_ventes}
                gradient="from-amber-500 via-orange-500 to-orange-700"
                glow="rgba(249, 115, 22, 0.4)"
                icon={ShoppingBag}
                loading={loadingKpis}
            />
            <SummaryCard
                label="Total Solde Clients"
                value={summary.solde_total}
                gradient="from-red-500 via-rose-600 to-red-800"
                glow="rgba(239, 68, 68, 0.4)"
                icon={Scale}
                loading={loadingKpis}
            />
        </div>
    );
}

const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm text-left outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy placeholder:text-slate-400';
const readOnlyClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-3 py-2 text-sm text-left cursor-not-allowed';

export function CaisseCalculatrice({ onSaleSaved } = {}) {
    const navigate = useNavigate();
    const [orderDate] = useState(todayRaw());
    const [clients, setClients] = useState([]);
    const [clientName, setClientName] = useState('');
    const [clientId, setClientId] = useState('');
    const [codeFidelite, setCodeFidelite] = useState('');
    const [filters, setFilters] = useState({ reference: '', code_barre: '', designation: '' });
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSuggest, setShowSuggest] = useState(false);
    const [lines, setLines] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);
    const refInput = useRef(null);
    const debounceRef = useRef(null);

    const selectedClient = useMemo(
        () => clients.find((c) => String(c.id) === String(clientId))
            || clients.find((c) => String(c.name || '').toLowerCase() === String(clientName || '').trim().toLowerCase()),
        [clients, clientId, clientName],
    );

    useEffect(() => {
        api.get('/clients', { params: { all: 1 } })
            .then((res) => setClients(res.data.data ?? []))
            .catch(() => setClients([]));
    }, []);

    // Sync code fidélité / id when name matches an existing client
    useEffect(() => {
        if (!clientName.trim()) {
            setClientId('');
            if (!codeFidelite) return;
            return;
        }
        const match = clients.find((c) => String(c.name || '').toLowerCase() === clientName.trim().toLowerCase());
        if (match) {
            setClientId(String(match.id));
            setCodeFidelite(match.code || '');
        } else {
            setClientId('');
        }
    }, [clientName, clients]);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const reference = filters.reference.trim();
        const code_barre = filters.code_barre.trim();
        const designation = filters.designation.trim();
        if (!reference && !code_barre && !designation) {
            setSuggestions([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        debounceRef.current = setTimeout(() => {
            const params = { all: 1 };
            if (reference) params.reference = reference;
            if (code_barre) params.code_barre = code_barre;
            if (designation) params.designation = designation;
            api.get('/products', { params })
                .then((res) => {
                    setSuggestions((res.data.data ?? []).slice(0, 12));
                    setShowSuggest(true);
                })
                .catch(() => setSuggestions([]))
                .finally(() => setSearching(false));
        }, 280);
        return () => clearTimeout(debounceRef.current);
    }, [filters]);

    const totalCaisse = useMemo(
        () => lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unit_price) || 0), 0),
        [lines],
    );

    const clearFilters = () => setFilters({ reference: '', code_barre: '', designation: '' });

    const selectClientByName = (name) => {
        setClientName(name);
        const match = clients.find((c) => String(c.name || '').toLowerCase() === String(name || '').trim().toLowerCase());
        if (match) {
            setClientId(String(match.id));
            setCodeFidelite(match.code || '');
        } else {
            setClientId('');
        }
    };

    const applyCodeFidelite = (value) => {
        setCodeFidelite(value);
        const raw = String(value || '').trim();
        if (!raw) return;
        const match = clients.find((c) =>
            String(c.code || '').toLowerCase() === raw.toLowerCase()
            || String(c.id) === raw.replace(/^CR-?/i, ''),
        );
        if (match) {
            setClientId(String(match.id));
            setClientName(match.name || '');
        }
    };

    const resolveClientId = async () => {
        const name = clientName.trim();
        if (!name) return null;
        if (clientId) return Number(clientId);
        const existing = clients.find((c) => String(c.name || '').toLowerCase() === name.toLowerCase());
        if (existing) return existing.id;
        const { data } = await api.post('/clients', { name, status: 'actif' });
        setClients((prev) => [...prev, data]);
        setClientId(String(data.id));
        setCodeFidelite(data.code || '');
        return data.id;
    };

    const addProduct = (product) => {
        if (!product) return;
        const stock = productStock(product);
        setFilters({
            reference: product.reference || '',
            code_barre: product.code_barre || '',
            designation: product.name || product.designation || '',
        });
        setLines((prev) => {
            const idx = prev.findIndex((l) => l.product_id === product.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], qty: (Number(next[idx].qty) || 0) + 1, stock };
                return next;
            }
            return [
                ...prev,
                {
                    key: `${product.id}-${Date.now()}`,
                    product_id: product.id,
                    reference: product.reference || '',
                    code_barre: product.code_barre || '',
                    designation: product.name || product.designation || '',
                    unit: product.unit || 'U',
                    categorie: product.categorie || '',
                    famille: product.famille || '',
                    marque: product.marque || product.brand || '',
                    unit_price: Number(product.unit_price ?? 0) || 0,
                    stock,
                    qty: 1,
                },
            ];
        });
        setSuggestions([]);
        setShowSuggest(false);
        setError('');
        setSuccess('');
        refInput.current?.focus();
    };

    const updateLine = (key, field, value) => {
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)));
    };

    const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

    const resetTicket = () => {
        setLines([]);
        clearFilters();
        setSuggestions([]);
        setClientId('');
        setClientName('');
        setCodeFidelite('');
    };

    const handleCloseCaisse = () => {
        resetTicket();
        setError('');
        setSuccess('');
        navigate('/');
    };

    const handleValider = async () => {
        setError('');
        setSuccess('');
        if (!clientName.trim()) {
            setError('Saisissez le nom du client.');
            return;
        }
        if (!lines.length) {
            setError('Ajoutez au moins un produit.');
            return;
        }
        setSaving(true);
        try {
            const resolvedId = await resolveClientId();
            if (!resolvedId) {
                setError('Impossible de résoudre le client.');
                setSaving(false);
                return;
            }
            const { data } = await api.post('/sales-orders', {
                client_id: Number(resolvedId),
                order_date: orderDate,
                status: 'valide',
                reglement: 'Esp',
                items: lines.map((l) => ({
                    product_id: l.product_id || null,
                    article_ref: l.reference || null,
                    code_barre: l.code_barre || null,
                    description: l.designation || 'Article',
                    categorie: l.categorie || null,
                    famille: l.famille || null,
                    marque: l.marque || null,
                    unit: l.unit || 'U',
                    quantity: Number(l.qty) || 1,
                    unit_price: Number(l.unit_price) || 0,
                })),
            });
            setSuccess(`Bon ${data.reference || ''} enregistré — visible dans Bon de Vente / Caisse.`);
            resetTicket();
            onSaleSaved?.(data);
        } catch (err) {
            setError(
                err.response?.data?.message
                || err.response?.data?.errors?.client_id?.[0]
                || err.response?.data?.errors?.name?.[0]
                || err.response?.data?.errors?.items?.[0]
                || 'Impossible d\'enregistrer le bon de vente',
            );
        } finally {
            setSaving(false);
        }
    };

    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions[0]) addProduct(suggestions[0]);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-100 dark:border-emerald-800">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                    <label className="field-label field-label-compact">Date</label>
                    <input type="text" readOnly value={todayLabel()} className={readOnlyClass} />
                </div>
                <div>
                    <label className="field-label field-label-compact">Nom Client</label>
                    <input
                        type="text"
                        list="caisse-clients-list"
                        value={clientName}
                        onChange={(e) => selectClientByName(e.target.value)}
                        placeholder="Saisir le nom du client"
                        className={inputClass}
                        autoComplete="off"
                    />
                    <datalist id="caisse-clients-list">
                        {clients.map((c) => (
                            <option key={c.id} value={c.name} />
                        ))}
                    </datalist>
                </div>
                <div>
                    <label className="field-label field-label-compact">Code Fidélité</label>
                    <input
                        type="text"
                        value={codeFidelite}
                        onChange={(e) => applyCodeFidelite(e.target.value)}
                        placeholder="CR-0001"
                        className={inputClass}
                    />
                </div>
            </div>

            <div
                className="relative"
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setShowSuggest(false);
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1.4fr_auto] gap-2 items-end">
                    <div>
                        <label className="field-label field-label-compact">Réf</label>
                        <input
                            ref={refInput}
                            type="text"
                            value={filters.reference}
                            onChange={(e) => setFilter('reference', e.target.value)}
                            onFocus={() => suggestions.length && setShowSuggest(true)}
                            onKeyDown={onSearchKeyDown}
                            placeholder="Réf"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="field-label field-label-compact">Code Barre</label>
                        <input
                            type="text"
                            value={filters.code_barre}
                            onChange={(e) => setFilter('code_barre', e.target.value)}
                            onFocus={() => suggestions.length && setShowSuggest(true)}
                            onKeyDown={onSearchKeyDown}
                            placeholder="Code Barre"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="field-label field-label-compact">Désignation</label>
                        <input
                            type="text"
                            value={filters.designation}
                            onChange={(e) => setFilter('designation', e.target.value)}
                            onFocus={() => suggestions.length && setShowSuggest(true)}
                            onKeyDown={onSearchKeyDown}
                            placeholder="Désignation"
                            className={inputClass}
                        />
                    </div>
                    <button
                        type="button"
                        title="Ajouter le premier résultat"
                        disabled={!suggestions.length}
                        onClick={() => addProduct(suggestions[0])}
                        className="btn-primary text-sm px-3 h-[38px] disabled:opacity-40"
                    >
                        <Plus className="w-4 h-4" />
                        {searching ? '…' : 'Ajouter'}
                    </button>
                </div>

                {showSuggest && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 left-0 right-0 max-h-56 overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-xl">
                        {suggestions.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addProduct(p)}
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                            >
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="font-mono text-brand-navy dark:text-blue-300">{p.reference || '—'}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{p.code_barre || '—'}</span>
                                    <span className="text-slate-800 dark:text-white font-medium flex-1 min-w-[120px]">{p.name || '—'}</span>
                                    <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        Stock&nbsp;: {formatStock(productStock(p))}
                                    </span>
                                    <span className="tabular-nums text-brand-navy dark:text-blue-300 font-semibold">
                                        {formatMontant(p.unit_price)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                            {['Réf', 'Code Barre', 'Désignation', 'Stock', 'Qté', 'P/U', 'S/Total', ''].map((h) => (
                                <th key={h || 'x'} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {lines.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                                    Aucun produit — renseignez Réf, Code Barre ou Désignation puis Ajouter
                                </td>
                            </tr>
                        ) : (
                            lines.map((line) => {
                                const st = (Number(line.qty) || 0) * (Number(line.unit_price) || 0);
                                const stock = Number(line.stock) || 0;
                                return (
                                    <tr key={line.key} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40">
                                        <td className="px-3 py-2 text-left font-mono text-xs text-slate-800 dark:text-slate-100">{line.reference || '—'}</td>
                                        <td className="px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-300">{line.code_barre || '—'}</td>
                                        <td className="px-3 py-2 text-left text-sm font-medium text-slate-800 dark:text-white">{line.designation || '—'}</td>
                                        <td className={`px-3 py-2 text-left text-sm font-semibold tabular-nums ${stock <= 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {formatStock(stock)}
                                        </td>
                                        <td className="px-3 py-2 text-left">
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="1"
                                                value={line.qty}
                                                onChange={(e) => updateLine(line.key, 'qty', e.target.value)}
                                                className="w-16 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-1.5 py-1 text-xs text-left tabular-nums"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-left">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={line.unit_price}
                                                onChange={(e) => updateLine(line.key, 'unit_price', e.target.value)}
                                                className="w-24 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-1.5 py-1 text-xs text-left tabular-nums"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-left font-semibold tabular-nums text-brand-navy dark:text-blue-300">
                                            {formatMontant(st)}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <button type="button" onClick={() => removeLine(line.key)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Total&nbsp;: </span>
                    <span className="text-lg font-bold tabular-nums text-brand-navy dark:text-blue-300">{formatMontant(totalCaisse)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleValider} disabled={saving || !lines.length} className="btn-primary text-sm disabled:opacity-50">
                        <CheckCircle2 className="w-4 h-4" />
                        {saving ? 'Validation...' : 'Valider'}
                    </button>
                    <button type="button" onClick={handleCloseCaisse} className="btn-danger text-sm">
                        <XCircle className="w-4 h-4" />
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CommercialPendingSales({ refreshKey = 0 }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const initialLoadDone = useRef(false);

    const load = useCallback((opts = {}) => {
        const silent = opts.silent === true || initialLoadDone.current;
        if (silent) setRefreshing(true);
        else setLoading(true);

        api.get('/sales-orders-pending-payment')
            .then((res) => setRows(res.data.data ?? []))
            .catch(() => {
                if (!silent) setRows([]);
            })
            .finally(() => {
                initialLoadDone.current = true;
                setLoading(false);
                setRefreshing(false);
            });
    }, []);

    useEffect(() => { load({ silent: false }); }, [refreshKey, load]);

    const headers = ['Date', 'N° Bon', 'Client', 'Articles', 'Type Rég', 'Montant', 'Payé', 'Solde', 'Statut'];

    return (
        <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
            <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-blue-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Tableau des ventes</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/80">{rows.length} vente(s)</span>
                    <button type="button" onClick={() => load({ silent: true })} className="p-1.5 rounded-lg text-white/80 hover:bg-white/10" title="Actualiser">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                            {headers.map((h) => (
                                <th key={h} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading && !initialLoadDone.current ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    {headers.map((h) => (
                                        <td key={h} className="px-3 py-3">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse max-w-[90px]" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400">
                                    Aucune vente — validez une caisse pour alimenter ce tableau
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const solde = Number(row.solde) || 0;
                                return (
                                    <tr key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40">
                                        <td className="px-3 py-2.5 text-left text-xs text-slate-600 dark:text-slate-300">{row.order_date || '—'}</td>
                                        <td className="px-3 py-2.5 text-left font-mono text-xs font-semibold text-brand-navy dark:text-blue-300">{row.reference || '—'}</td>
                                        <td className="px-3 py-2.5 text-left text-sm font-medium text-slate-800 dark:text-white">{row.client || '—'}</td>
                                        <td className="px-3 py-2.5 text-left text-xs text-slate-700 dark:text-slate-200 max-w-[220px] truncate" title={row.articles || ''}>
                                            {row.articles || row.designation || '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200">{row.reglement || '—'}</td>
                                        <td className="px-3 py-2.5 text-left tabular-nums text-sm text-slate-700 dark:text-slate-200">{formatMontant(row.montant)}</td>
                                        <td className="px-3 py-2.5 text-left tabular-nums text-sm font-semibold amount-paye">{formatMontant(row.montant_paye)}</td>
                                        <td className={`px-3 py-2.5 text-left tabular-nums text-sm ${solde > 0 ? 'amount-solde-due' : 'amount-solde-ok'}`}>
                                            {formatMontant(row.solde)}
                                        </td>
                                        <td className="px-3 py-2.5 text-left">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                                row.status === 'encaisse'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                            }`}>
                                                {row.status_label || '—'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/** Accueil commercial : cartes KPI + ventes en attente de paiement */
export default function CommercialDashboard() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-auto">
            <div className="shrink-0 px-4 lg:px-6 pt-3 pb-4 space-y-4">
                <CommercialKpis />
                <CommercialPendingSales refreshKey={refreshKey} />
            </div>
        </div>
    );
}
