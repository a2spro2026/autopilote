import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Printer, X, RefreshCw, Search, AlertTriangle, Ban, Clock,
    ArrowDownCircle, ArrowUpCircle, BadgeCheck, Vault, Scale, Package,
} from 'lucide-react';
import api from '../lib/api';

const emptyFilters = {
    date_from: '',
    date_to: '',
    supplier_id: '',
    client_livre: '',
};

const columns = [
    'Opération', 'Date', 'N° Bn', 'Client Livré', 'Ville Liv', 'Qte',
    'Débit', 'Crédit', 'Solde', 'Type Rég', 'N° Rég', 'Nom Tiré',
    'Date Encaiss', 'Payé', 'Dévalidé', 'Impayé', 'Reporté',
];

function formatMontant(value) {
    const n = Number(value) || 0;
    if (Math.abs(n) < 0.005) return '—';
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQty(value) {
    if (value === null || value === undefined || value === '') return '—';
    const n = Number(value) || 0;
    if (Math.abs(n) < 0.0005) return '—';
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 3 });
}

function Field({ label, children }) {
    return (
        <div className="min-w-0">
            <label className="field-label field-label-compact">{label}</label>
            {children}
        </div>
    );
}

const filterClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange';
const disabledFilterClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 px-2.5 py-2 text-xs cursor-not-allowed opacity-60';
const grayCellClass = 'px-2.5 py-2 text-center text-slate-400 dark:text-slate-500 opacity-50';

function SummaryCard({ label, value, gradient, glow, icon: Icon, compact = false, format = 'money' }) {
    const display = format === 'qty'
        ? (Number(value) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })
        : (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} text-white ${compact ? 'p-2' : 'p-2.5'}`}
            style={{ boxShadow: `0 8px 22px -8px ${glow}` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
            <div className="relative flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                    <p className={`font-semibold uppercase tracking-wider text-white/85 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>{label}</p>
                    <p className={`mt-0.5 font-bold tabular-nums leading-tight ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}>
                        {display}
                    </p>
                </div>
                <div className={`rounded-lg bg-white/15 ring-1 ring-white/20 shrink-0 ${compact ? 'p-1' : 'p-1.5'}`}>
                    <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function StatusMark({ active, tone }) {
    if (!active) return <span className="text-slate-300 dark:text-slate-600">—</span>;
    const colors = {
        green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    };
    return (
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[tone]}`}>
            ✓
        </span>
    );
}

function buildPrintHtml(rows, summary, filtersLabel) {
    const body = rows.map((row) => `<tr>
        <td>${row.operation || '—'}</td>
        <td>${row.date || '—'}</td>
        <td>${row.numero_bn || '—'}</td>
        <td>${row.client_livre || '—'}</td>
        <td>${row.ville_liv || '—'}</td>
        <td>${formatQty(row.qte)}</td>
        <td>${formatMontant(row.debit)}</td>
        <td>${formatMontant(row.credit)}</td>
        <td>${(Number(row.solde) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${row.type_reg || '—'}</td>
        <td>${row.numero_reg || '—'}</td>
        <td>${row.nom_tire || '—'}</td>
        <td>${row.date_encaiss || '—'}</td>
        <td>${row.paye ? 'Oui' : '—'}</td>
        <td>${row.devalide ? 'Oui' : '—'}</td>
        <td>${row.impaye ? 'Oui' : '—'}</td>
        <td>${row.reporte ? 'Oui' : '—'}</td>
    </tr>`).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relevé Compte Fournisseur</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#1e293b;font-size:11px}
h1{color:#1e3a5f;font-size:20px;margin:0 0 4px}
.sub{color:#64748b;margin-bottom:12px}
.cards{display:flex;gap:10px;margin:12px 0 16px}
.card{flex:1;padding:10px;border-radius:8px;color:#fff;font-weight:700}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #e2e8f0;padding:5px 4px;text-align:center}
th{background:#f1f5f9;font-size:9px;text-transform:uppercase}
</style></head><body>
<h1>Autopilote — Relevé de compte fournisseur</h1>
<p class="sub">${filtersLabel}</p>
<div class="cards">
<div class="card" style="background:#dc2626">Imp : ${(Number(summary.total_imp) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
<div class="card" style="background:#7c3aed">Déva : ${(Number(summary.total_deva) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
<div class="card" style="background:#d97706">Repo : ${(Number(summary.total_repo) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
</div>
<table>
<thead><tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
<tbody>${body || '<tr><td colspan="17">Aucune opération</td></tr>'}</tbody>
</table>
</body></html>`;
}

function openPrintable(rows, summary, filtersLabel) {
    const w = window.open('', '_blank', 'width=1400,height=800');
    if (!w) return;
    w.document.write(buildPrintHtml(rows, summary, filtersLabel));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
}

export default function SupplierRelevePage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(emptyFilters);
    const [applied, setApplied] = useState(emptyFilters);
    const [suppliers, setSuppliers] = useState([]);
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({
        total_imp: 0, total_deva: 0, total_repo: 0,
        total_debit: 0, total_credit: 0, total_encaisse: 0,
        total_coffre: 0, solde: 0, total_qte: 0,
    });
    const [loading, setLoading] = useState(true);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    const load = useCallback(() => {
        setLoading(true);
        const params = {};
        if (applied.date_from) params.date_from = applied.date_from;
        if (applied.date_to) params.date_to = applied.date_to;
        if (applied.supplier_id) params.supplier_id = applied.supplier_id;

        api.get('/supplier-releve', { params })
            .then((r) => {
                setRows(r.data.data ?? []);
                setSummary({
                    total_imp: Number(r.data.meta?.total_imp) || 0,
                    total_deva: Number(r.data.meta?.total_deva) || 0,
                    total_repo: Number(r.data.meta?.total_repo) || 0,
                    total_debit: Number(r.data.meta?.total_debit) || 0,
                    total_credit: Number(r.data.meta?.total_credit) || 0,
                    total_encaisse: Number(r.data.meta?.total_encaisse) || 0,
                    total_coffre: Number(r.data.meta?.total_coffre) || 0,
                    solde: Number(r.data.meta?.solde) || 0,
                    total_qte: Number(r.data.meta?.total_qte) || 0,
                });
            })
            .catch(() => {
                setRows([]);
                setSummary({
                    total_imp: 0, total_deva: 0, total_repo: 0,
                    total_debit: 0, total_credit: 0, total_encaisse: 0,
                    total_coffre: 0, solde: 0, total_qte: 0,
                });
            })
            .finally(() => setLoading(false));
    }, [applied]);

    useEffect(() => {
        api.get('/suppliers', { params: { all: 1 } })
            .then((r) => setSuppliers(r.data.data ?? []))
            .catch(() => setSuppliers([]));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleSearch = () => setApplied({ ...filters });
    const handleReset = () => {
        setFilters(emptyFilters);
        setApplied(emptyFilters);
    };

    const supplierName = suppliers.find((s) => String(s.id) === String(applied.supplier_id))?.name || 'Tous les fournisseurs';
    const filtersLabel = [
        applied.date_from ? `Du ${applied.date_from}` : null,
        applied.date_to ? `au ${applied.date_to}` : null,
        supplierName,
    ].filter(Boolean).join(' · ');

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 gap-3">
            <div className="shrink-0 space-y-3 sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 pb-1">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Relevé de compte fournisseur</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Achats et règlements consolidés</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => openPrintable(rows, summary, filtersLabel)} className="btn-primary text-xs">
                            <FileText className="w-3.5 h-3.5" /> Envoyer PDF
                        </button>
                        <button type="button" onClick={() => openPrintable(rows, summary, filtersLabel)} className="btn-secondary text-xs">
                            <Printer className="w-3.5 h-3.5" /> Imprimer
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="btn-muted text-xs">
                            <X className="w-3.5 h-3.5" /> Fermer
                        </button>
                        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-[320px]">
                            <SummaryCard
                                compact
                                label="Imp"
                                value={summary.total_imp}
                                gradient="from-red-500 via-rose-600 to-red-800"
                                glow="rgba(220, 38, 38, 0.45)"
                                icon={AlertTriangle}
                            />
                            <SummaryCard
                                compact
                                label="Déva"
                                value={summary.total_deva}
                                gradient="from-violet-500 via-purple-600 to-indigo-900"
                                glow="rgba(124, 58, 237, 0.45)"
                                icon={Ban}
                            />
                            <SummaryCard
                                compact
                                label="Repo"
                                value={summary.total_repo}
                                gradient="from-amber-400 via-yellow-500 to-amber-600"
                                glow="rgba(217, 119, 6, 0.45)"
                                icon={Clock}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                    <SummaryCard
                        label="Total Débit"
                        value={summary.total_debit}
                        gradient="from-rose-500 via-red-600 to-rose-800"
                        glow="rgba(225, 29, 72, 0.4)"
                        icon={ArrowDownCircle}
                    />
                    <SummaryCard
                        label="Total Crédit"
                        value={summary.total_credit}
                        gradient="from-emerald-500 via-teal-600 to-green-800"
                        glow="rgba(16, 185, 129, 0.4)"
                        icon={ArrowUpCircle}
                    />
                    <SummaryCard
                        label="Total Encaissé"
                        value={summary.total_encaisse}
                        gradient="from-zinc-900 via-zinc-950 to-orange-900"
                        glow="rgba(30, 58, 95, 0.45)"
                        icon={BadgeCheck}
                    />
                    <SummaryCard
                        label="Coffre"
                        value={summary.total_coffre}
                        gradient="from-orange-500 via-orange-600 to-zinc-900"
                        glow="rgba(14, 165, 233, 0.4)"
                        icon={Vault}
                    />
                    <SummaryCard
                        label="Solde"
                        value={summary.solde}
                        gradient="from-orange-500 via-amber-600 to-orange-800"
                        glow="rgba(249, 115, 22, 0.4)"
                        icon={Scale}
                    />
                    <SummaryCard
                        label="Quantité"
                        value={summary.total_qte}
                        format="qty"
                        gradient="from-slate-600 via-slate-700 to-slate-900"
                        glow="rgba(71, 85, 105, 0.4)"
                        icon={Package}
                    />
                </div>

                <div className="glass-card p-3 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr_1.3fr_auto] gap-2.5 items-end">
                        <Field label="De">
                            <input type="date" value={filters.date_from} onChange={(e) => setFilter('date_from', e.target.value)} className={filterClass} />
                        </Field>
                        <Field label="A">
                            <input type="date" value={filters.date_to} onChange={(e) => setFilter('date_to', e.target.value)} className={filterClass} />
                        </Field>
                        <Field label="Nom Fournisseur">
                            <select value={filters.supplier_id} onChange={(e) => setFilter('supplier_id', e.target.value)} className={filterClass}>
                                <option value="">Tous les fournisseurs</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Client Livré">
                            <input
                                type="text"
                                disabled
                                value=""
                                placeholder="—"
                                className={disabledFilterClass}
                                title="Section à venir"
                            />
                        </Field>
                        <div className="flex items-center gap-1.5 self-end">
                            <button type="button" onClick={handleSearch} className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800" title="Actualiser">
                                <Search className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={load} disabled={loading} className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800" title="Actualiser">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button type="button" onClick={handleReset} className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Fermer / réinitialiser">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                <div className="px-5 py-2.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-orange-900 border-b border-white/10 shrink-0">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Relevé de compte</h3>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-sm min-w-[1500px]">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gradient-to-r from-slate-100 via-slate-200/90 to-slate-100 dark:from-slate-800 dark:via-slate-700/80 dark:to-slate-800 border-b-2 border-slate-300 dark:border-slate-600">
                                {columns.map((h) => (
                                    <th
                                        key={h}
                                        className={`px-2.5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] whitespace-nowrap text-center bg-slate-100 dark:bg-slate-800 ${
                                            h === 'Client Livré' || h === 'Ville Liv'
                                                ? 'text-slate-400 dark:text-slate-500 opacity-50'
                                                : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        {columns.map((__, j) => (
                                            <td key={j} className="px-2.5 py-3 text-center">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[60px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row, idx) => (
                                    <tr key={`${row.operation}-${row.numero_bn}-${idx}`} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/40">
                                        <td className="px-2.5 py-2 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                row.operation === 'Achat'
                                                    ? 'bg-blue-50 text-orange-700 dark:bg-blue-900/30 dark:text-orange-300'
                                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            }`}>
                                                {row.operation}
                                            </span>
                                        </td>
                                        <td className="px-2.5 py-2 text-center text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.date || '—'}</td>
                                        <td className="px-2.5 py-2 text-center font-mono text-[11px] font-semibold text-brand-navy dark:text-orange-300">{row.numero_bn || '—'}</td>
                                        <td className={`${grayCellClass} max-w-[140px] truncate`} title="Section à venir">—</td>
                                        <td className={grayCellClass} title="Section à venir">—</td>
                                        <td className="px-2.5 py-2 text-center tabular-nums text-slate-700 dark:text-slate-200">{formatQty(row.qte)}</td>
                                        <td className="px-2.5 py-2 text-center tabular-nums font-semibold text-rose-700 dark:text-rose-400">{formatMontant(row.debit)}</td>
                                        <td className="px-2.5 py-2 text-center tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">{formatMontant(row.credit)}</td>
                                        <td className="px-2.5 py-2 text-center tabular-nums font-bold text-brand-navy dark:text-orange-400">
                                            {(Number(row.solde) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2.5 py-2 text-center text-slate-600 dark:text-slate-300">{row.type_reg || '—'}</td>
                                        <td className="px-2.5 py-2 text-center font-mono text-[11px] text-slate-600 dark:text-slate-300">{row.numero_reg || '—'}</td>
                                        <td className="px-2.5 py-2 text-center text-slate-700 dark:text-slate-200 max-w-[120px] truncate" title={row.nom_tire || ''}>{row.nom_tire || '—'}</td>
                                        <td className="px-2.5 py-2 text-center text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.date_encaiss || '—'}</td>
                                        <td className="px-2.5 py-2 text-center"><StatusMark active={row.paye} tone="green" /></td>
                                        <td className="px-2.5 py-2 text-center"><StatusMark active={row.devalide} tone="violet" /></td>
                                        <td className="px-2.5 py-2 text-center"><StatusMark active={row.impaye} tone="red" /></td>
                                        <td className="px-2.5 py-2 text-center"><StatusMark active={row.reporte} tone="yellow" /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        Aucune opération pour ces critères
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
