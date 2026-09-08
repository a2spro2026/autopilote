import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowDownCircle, ArrowUpCircle, Download, Printer, Scale, Search, XCircle,
} from 'lucide-react';
import api from '../lib/api';

const emptyFilters = {
    mois: '',
    operation: '',
    type: '',
};

const OPERATION_OPTIONS = [
    { value: '', label: 'Toutes' },
    { value: 'Achat', label: 'Achat' },
    { value: 'Vente', label: 'Vente' },
];

const TYPE_OPTIONS = [
    { value: '', label: 'Tous' },
    { value: 'Débit', label: 'Débit' },
    { value: 'Crédit', label: 'Crédit' },
    { value: 'Caisse', label: 'Caisse' },
];

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

function buildPrintHtml(rows, summary, filters) {
    const filterParts = [];
    if (filters.mois) filterParts.push(`Mois: ${filters.mois}`);
    if (filters.operation) filterParts.push(`Opération: ${filters.operation}`);
    if (filters.type) filterParts.push(`Type: ${filters.type}`);
    const filterLabel = filterParts.length ? filterParts.join(' · ') : 'Tous les mouvements';

    const body = rows.map((r) => `<tr>
<td>${r.date || '—'}</td>
<td>${r.operation || '—'}</td>
<td>${formatMontant(r.debit)}</td>
<td>${formatMontant(r.credit)}</td>
<td>${r.caisse != null && r.caisse !== '' ? formatMontant(r.caisse) : '—'}</td>
<td>${r.date_decaiss || '—'}</td>
<td>${r.date_encaiss || '—'}</td>
</tr>`).join('');

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Rapport Trésorerie</title>
<style>
body{font-family:Arial,sans-serif;padding:28px;color:#1e293b}
h1{color:#1e3a5f;font-size:22px;margin:0 0 6px}
.meta{color:#64748b;font-size:12px;margin-bottom:14px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{border:1px solid #e2e8f0;padding:8px;font-size:11px;text-align:center}
th{background:#f8fafc;font-weight:700}
.cards{display:flex;gap:12px;margin:12px 0 18px}
.card{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center}
.card strong{display:block;font-size:16px;margin-top:4px}
</style></head><body>
<h1>Autopilote — Rapport Trésorerie</h1>
<p class="meta">${filterLabel} · Édité le ${summary.date || '—'}</p>
<div class="cards">
<div class="card">Total Débit<strong>${formatMontant(summary.total_debit)}</strong></div>
<div class="card">Total Crédit<strong>${formatMontant(summary.total_credit)}</strong></div>
<div class="card">Total Solde<strong>${formatMontant(summary.total_solde)}</strong></div>
</div>
<table>
<thead><tr>
<th>Date</th><th>Opération</th><th>Débit</th><th>Crédit</th><th>Caisse</th><th>Date Décaiss</th><th>Date Encaiss</th>
</tr></thead>
<tbody>${body || '<tr><td colspan="7">Aucun mouvement</td></tr>'}</tbody>
</table>
</body></html>`;
}

function downloadCsv(rows) {
    const header = ['Date', 'Opération', 'Débit', 'Crédit', 'Caisse', 'Date Décaiss', 'Date Encaiss'];
    const lines = [header.join(';')];
    rows.forEach((r) => {
        lines.push([
            r.date || '',
            r.operation || '',
            String(Number(r.debit) || 0).replace('.', ','),
            String(Number(r.credit) || 0).replace('.', ','),
            r.caisse != null && r.caisse !== '' ? String(Number(r.caisse) || 0).replace('.', ',') : '',
            r.date_decaiss || '',
            r.date_encaiss || '',
        ].join(';'));
    });
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-tresorerie-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

const columns = ['Date', 'Opération', 'Débit', 'Crédit', 'Caisse', 'Date Décaiss', 'Date Encaiss'];

export default function RapportTresoreriePage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(emptyFilters);
    const [applied, setApplied] = useState(emptyFilters);
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ total_debit: 0, total_credit: 0, total_solde: 0, date: '—' });
    const [loading, setLoading] = useState(true);
    const months = useMemo(() => monthOptions(), []);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    const load = useCallback(() => {
        setLoading(true);
        const params = {};
        if (applied.mois) params.mois = applied.mois;
        if (applied.operation) params.operation = applied.operation;
        if (applied.type) params.type = applied.type;

        api.get('/tresorerie-rapport', { params })
            .then((res) => {
                setRows(res.data.data ?? []);
                setSummary({
                    total_debit: Number(res.data.meta?.total_debit) || 0,
                    total_credit: Number(res.data.meta?.total_credit) || 0,
                    total_solde: Number(res.data.meta?.total_solde) || 0,
                    date: res.data.meta?.date || '—',
                });
            })
            .catch(() => {
                setRows([]);
                setSummary({ total_debit: 0, total_credit: 0, total_solde: 0, date: '—' });
            })
            .finally(() => setLoading(false));
    }, [applied]);

    useEffect(() => { load(); }, [load]);

    const handleSearch = () => setApplied({ ...filters });

    const handlePrint = () => {
        const win = window.open('', '_blank', 'width=1100,height=800');
        if (!win) return;
        win.document.write(buildPrintHtml(rows, summary, applied));
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 300);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryCard
                    label="Total Débit"
                    value={summary.total_debit}
                    gradient="from-rose-500 via-red-600 to-red-900"
                    glow="rgba(225, 29, 72, 0.4)"
                    icon={ArrowDownCircle}
                />
                <SummaryCard
                    label="Total Crédit"
                    value={summary.total_credit}
                    gradient="from-emerald-500 via-green-600 to-teal-800"
                    glow="rgba(16, 185, 129, 0.4)"
                    icon={ArrowUpCircle}
                />
                <SummaryCard
                    label="Total Solde"
                    value={summary.total_solde}
                    gradient="from-amber-500 via-orange-500 to-orange-800"
                    glow="rgba(249, 115, 22, 0.45)"
                    icon={Scale}
                />
            </div>

            <div className="glass-card p-4 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2.5 items-end">
                    <Field label="Mois">
                        <select value={filters.mois} onChange={(e) => setFilter('mois', e.target.value)} className={filterClass}>
                            {months.map((m) => <option key={m.value || 'all'} value={m.value}>{m.label}</option>)}
                        </select>
                    </Field>
                    <Field label="Opération">
                        <select value={filters.operation} onChange={(e) => setFilter('operation', e.target.value)} className={filterClass}>
                            {OPERATION_OPTIONS.map((o) => <option key={o.value || 'all'} value={o.value}>{o.label}</option>)}
                        </select>
                    </Field>
                    <Field label="Type">
                        <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className={filterClass}>
                            {TYPE_OPTIONS.map((o) => <option key={o.value || 'all'} value={o.value}>{o.label}</option>)}
                        </select>
                    </Field>
                    <button type="button" onClick={handleSearch} className="btn-secondary text-xs h-[34px] px-4 self-end">
                        <Search className="w-3.5 h-3.5" /> Rechercher
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={handlePrint} className="btn-secondary text-xs">
                    <Printer className="w-3.5 h-3.5" /> Imprimer
                </button>
                <button type="button" onClick={() => downloadCsv(rows)} className="btn-secondary text-xs">
                    <Download className="w-3.5 h-3.5" /> Télécharger
                </button>
                <button type="button" onClick={() => navigate('/')} className="btn-danger text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Fermer
                </button>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-slate-900 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Rapport Trésorerie</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[980px]">
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
                                        <td key={j} className="px-3 py-3 text-center">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[80px]" />
                                        </td>
                                    ))}</tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.date || '—'}</td>
                                        <td className="px-3 py-2.5 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                row.operation === 'Vente'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                            }`}>
                                                {row.operation || '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                                            {(Number(row.debit) || 0) > 0 ? formatMontant(row.debit) : '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center tabular-nums font-semibold text-emerald-700 dark:text-emerald-300">
                                            {(Number(row.credit) || 0) > 0 ? formatMontant(row.credit) : '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center tabular-nums font-semibold text-sky-700 dark:text-sky-300">
                                            {row.caisse != null && row.caisse !== '' ? formatMontant(row.caisse) : '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.date_decaiss || '—'}</td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.date_encaiss || '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        Aucun mouvement de trésorerie
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
