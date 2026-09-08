import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search, Scale, Wallet, Receipt, Printer, XCircle, X } from 'lucide-react';
import api from '../../lib/api';
import { ReliquatCell } from './clientAmountUtils';

const emptyFilters = {
    mois: '',
    client_id: '',
};

function Field({ label, children }) {
    return (
        <div>
            <label className="field-label">{label}</label>
            {children}
        </div>
    );
}

const filterClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy';

function formatMontant(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SoldeClientCell({ value }) {
    const n = Number(value) || 0;
    if (n > 0) {
        return (
            <span className="tabular-nums font-bold amount-solde-due">
                {formatMontant(n)}
            </span>
        );
    }
    return (
        <span className="tabular-nums font-bold amount-solde-ok">
            {formatMontant(n)}
        </span>
    );
}

function SummaryCard({ label, value, gradient, glow, icon: Icon }) {
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
                    <p className="mt-1.5 text-lg sm:text-xl font-bold tabular-nums leading-tight">{formatMontant(value)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function monthOptions() {
    const now = new Date();
    const options = [{ value: '', label: 'Tous les mois' }];
    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
}

function buildFeuilleHtml({ client, orders, balance }) {
    const orderBlocks = (orders || []).map((o) => {
        const items = (o.items?.length ? o.items : [{
            article_ref: o.article_ref,
            description: o.designation || o.articles,
            quantity: o.quantity,
            unit_price: o.unit_price,
            total: o.subtotal || o.montant,
        }]).map((i) => `<tr>
<td>${i.article_ref || '—'}</td>
<td>${i.description || '—'}</td>
<td>${i.quantity ?? '—'}</td>
<td>${formatMontant(i.unit_price)}</td>
<td><strong>${formatMontant(i.total)}</strong></td>
</tr>`).join('');

        return `
<h2 style="margin-top:22px;font-size:14px;color:#1e3a5f">Bon ${o.reference || '—'} — ${o.order_date || '—'}</h2>
<table>
<tr><th>Rég</th><td>${o.reglement || '—'}</td><th>Statut</th><td>${o.status_label || o.status || '—'}</td></tr>
<tr><th>Montant TTC</th><td>${formatMontant(o.montant)}</td><th>Payé / Solde</th><td>${formatMontant(o.montant_paye)} / ${formatMontant(o.solde)}</td></tr>
</table>
<table>
<thead><tr><th>Réf</th><th>Désignation</th><th>Qté</th><th>P/U</th><th>S/Total</th></tr></thead>
<tbody>${items || '<tr><td colspan="5">—</td></tr>'}</tbody>
</table>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Feuille de commande — ${client || ''}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}h1{color:#1e3a5f;font-size:22px;margin:0 0 8px}
h2{border-bottom:1px solid #e2e8f0;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #e2e8f0;padding:8px;font-size:11px;text-align:center}
th{background:#f8fafc;font-weight:700}.badge{background:#eef2ff;color:#3730a3;padding:4px 10px;border-radius:999px;font-weight:700}
.summary{margin-top:8px;margin-bottom:16px}
</style></head><body>
<h1>Autopilote — Feuille de commande <span class="badge">${client || '—'}</span></h1>
<table class="summary">
<tr><th>Client</th><td>${client || '—'}</td><th>Date balance</th><td>${balance?.date || '—'}</td></tr>
<tr><th>Total Ventes</th><td>${formatMontant(balance?.total_ventes)}</td><th>Montant Payé</th><td>${formatMontant(balance?.montant_paye)}</td></tr>
<tr><th>Solde</th><td>${formatMontant(balance?.solde)}</td><th>Reliquat</th><td>${formatMontant(balance?.reliquat)}</td></tr>
</table>
${orderBlocks || '<p>Aucune commande</p>'}
</body></html>`;
}

function openPrintableFeuille(payload) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(buildFeuilleHtml(payload));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

function FeuilleCommandeModal({ clientRow, orders, loading, onClose }) {
    if (!clientRow) return null;

    const payload = {
        client: clientRow.client,
        orders,
        balance: clientRow,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-navy to-blue-800 shrink-0">
                    <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider">Feuille de commande</p>
                        <h3 className="text-white font-bold">{clientRow.client}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                            ['Date', clientRow.date || '—'],
                            ['Total Ventes', formatMontant(clientRow.total_ventes)],
                            ['Payé', formatMontant(clientRow.montant_paye)],
                            ['Solde', formatMontant(clientRow.solde)],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                                <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-center text-slate-400 py-8 text-sm">Aucune commande pour ce client</p>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((o) => (
                                <div key={o.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-mono text-xs font-bold text-brand-navy dark:text-blue-300">{o.reference}</p>
                                            <p className="text-[11px] text-slate-500">{o.order_date} · {o.status_label || o.status || '—'}</p>
                                        </div>
                                        <div className="text-right text-xs">
                                            <p className="font-semibold tabular-nums">{formatMontant(o.montant)}</p>
                                            <p className={`tabular-nums ${Number(o.solde) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                Solde {formatMontant(o.solde)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-2 divide-y divide-slate-100 dark:divide-slate-800">
                                        {(o.items || []).map((item, idx) => (
                                            <div key={item.id || idx} className="py-1.5 flex justify-between gap-3 text-xs">
                                                <span className="text-slate-700 dark:text-slate-200 truncate">
                                                    {item.article_ref ? `${item.article_ref} — ` : ''}{item.description}
                                                </span>
                                                <span className="tabular-nums text-slate-600 dark:text-slate-300 shrink-0">
                                                    {item.quantity} × {formatMontant(item.unit_price)} = {formatMontant(item.total)}
                                                </span>
                                            </div>
                                        ))}
                                        {!o.items?.length && (
                                            <p className="py-2 text-xs text-slate-400">{o.articles || o.designation || '—'}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                    <button
                        type="button"
                        onClick={() => openPrintableFeuille(payload)}
                        disabled={loading || !orders.length}
                        className="btn-secondary text-sm flex-1 disabled:opacity-50"
                    >
                        <Printer className="w-4 h-4" /> Imprimer
                    </button>
                    <button type="button" onClick={onClose} className="btn-danger text-sm flex-1">
                        <XCircle className="w-4 h-4" /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

const columns = ['Date', 'Client', 'Total Ventes', 'Montant Payé', 'Solde', 'Reliquat'];

export default function ClientBalancePage() {
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ total_ventes: 0, solde_total: 0, reliquat_total: 0 });
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feuilleRow, setFeuilleRow] = useState(null);
    const [feuilleOrders, setFeuilleOrders] = useState([]);
    const [feuilleLoading, setFeuilleLoading] = useState(false);
    const months = monthOptions();

    const load = useCallback(() => {
        setLoading(true);
        const params = {};
        if (appliedFilters.mois) params.mois = appliedFilters.mois;
        if (appliedFilters.client_id) params.client_id = appliedFilters.client_id;

        api.get('/client-orders/balance', { params })
            .then((res) => {
                setRows(res.data.data ?? []);
                setSummary({
                    total_ventes: Number(res.data.meta?.total_ventes) || 0,
                    solde_total: Number(res.data.meta?.solde_total) || 0,
                    reliquat_total: Number(res.data.meta?.reliquat_total) || 0,
                });
            })
            .catch(() => {
                setRows([]);
                setSummary({ total_ventes: 0, solde_total: 0, reliquat_total: 0 });
            })
            .finally(() => setLoading(false));
    }, [appliedFilters]);

    useEffect(() => {
        api.get('/clients', { params: { all: 1 } })
            .then((r) => setClients(r.data.data ?? []))
            .catch(() => setClients([]));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    const handleSearch = () => setAppliedFilters({ ...filters });

    const openFeuille = async (row) => {
        setFeuilleRow(row);
        setFeuilleOrders([]);
        setFeuilleLoading(true);
        try {
            const { data } = await api.get('/sales-orders', {
                params: { all: 1, client_id: row.client_id || row.id },
            });
            setFeuilleOrders(data.data ?? []);
        } catch {
            setFeuilleOrders([]);
        } finally {
            setFeuilleLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Balance Clients</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Situation consolidée par client — double-clic pour la feuille de commande
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryCard
                    label="Total Ventes"
                    value={summary.total_ventes}
                    gradient="from-brand-navy via-blue-800 to-indigo-900"
                    glow="rgba(30, 58, 95, 0.45)"
                    icon={Receipt}
                />
                <SummaryCard
                    label="Solde Total"
                    value={summary.solde_total}
                    gradient="from-red-500 via-rose-600 to-red-800"
                    glow="rgba(239, 68, 68, 0.4)"
                    icon={Scale}
                />
                <SummaryCard
                    label="Reliquat"
                    value={summary.reliquat_total}
                    gradient="from-amber-400 via-yellow-500 to-amber-600"
                    glow="rgba(245, 158, 11, 0.4)"
                    icon={Wallet}
                />
            </div>

            <div className="glass-card p-4 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_auto] gap-2.5 items-end max-w-3xl">
                    <Field label="Mois">
                        <select value={filters.mois} onChange={(e) => setFilter('mois', e.target.value)} className={filterClass}>
                            {months.map((m) => (
                                <option key={m.value || 'all'} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Client">
                        <select value={filters.client_id} onChange={(e) => setFilter('client_id', e.target.value)} className={filterClass}>
                            <option value="">Tous les clients</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </Field>
                    <button type="button" onClick={handleSearch} className="btn-secondary text-xs h-[34px] px-4 self-end">
                        <Search className="w-3.5 h-3.5" /> Rechercher
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-slate-700 via-slate-800 to-brand-navy border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Balance clients</h3>
                    <button type="button" onClick={load} disabled={loading} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Actualiser">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
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
                                        onDoubleClick={() => openFeuille(row)}
                                        title="Double-clic : feuille de commande"
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.date || '—'}</td>
                                        <td className="px-4 py-2.5 text-center font-medium text-slate-800 dark:text-white">{row.client}</td>
                                        <td className="px-4 py-2.5 text-center font-semibold tabular-nums text-brand-navy dark:text-violet-400">{formatMontant(row.total_ventes)}</td>
                                        <td className="px-4 py-2.5 text-center tabular-nums amount-paye">{formatMontant(row.montant_paye)}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <SoldeClientCell value={row.solde} />
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <ReliquatCell value={row.reliquat} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        Aucune donnée pour ces critères
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {feuilleRow && (
                <FeuilleCommandeModal
                    clientRow={feuilleRow}
                    orders={feuilleOrders}
                    loading={feuilleLoading}
                    onClose={() => {
                        setFeuilleRow(null);
                        setFeuilleOrders([]);
                    }}
                />
            )}
        </div>
    );
}
