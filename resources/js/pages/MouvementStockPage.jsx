import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, XCircle, RefreshCw, ArrowLeftRight } from 'lucide-react';
import api from '../lib/api';

function formatQte(value) {
    const n = Number(value) || 0;
    if (n === 0) return '0';
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 3 });
}

function yearOptions() {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2, y - 3, y - 4];
}

function MonthCell({ cell }) {
    const achats = Number(cell?.achats) || 0;
    const ventes = Number(cell?.ventes) || 0;
    if (achats === 0 && ventes === 0) {
        return <span className="text-slate-300 dark:text-slate-600">—</span>;
    }
    return (
        <div className="leading-tight text-[11px] tabular-nums">
            <div className="font-semibold text-emerald-600 dark:text-emerald-400" title="Achats">{formatQte(achats)}</div>
            <div className="font-semibold text-orange-600 dark:text-orange-400" title="Ventes">{formatQte(ventes)}</div>
        </div>
    );
}

function buildPrintHtml(rows, months, annee) {
    const monthHeads = months.map((m) => `<th>${m.label}<br/><span style="font-weight:500;font-size:9px">A / V</span></th>`).join('');
    const body = rows.map((r) => {
        const monthCells = months.map((m) => {
            const c = r.months?.[m.key] || {};
            return `<td>${formatQte(c.achats)} / ${formatQte(c.ventes)}</td>`;
        }).join('');
        return `<tr>
<td>${r.reference || '—'}</td>
<td>${r.designation || '—'}</td>
<td>${formatQte(r.qte_initiale)}</td>
${monthCells}
<td><strong>${formatQte(r.qte_stock)}</strong></td>
</tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mouvement Stock ${annee}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}h1{color:#1e3a5f;font-size:18px;margin:0 0 4px}
.sub{color:#64748b;font-size:11px;margin-bottom:12px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #e2e8f0;padding:5px;font-size:9px;text-align:center}
th{background:#e8eef7;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#1e3a5f}
.legend{font-size:10px;margin-top:8px}.a{color:#059669}.v{color:#ea580c}
</style></head><body>
<h1>Autopilote — Mouvement Stock ${annee}</h1>
<p class="sub">Par mois : Achats / Ventes</p>
<table>
<thead><tr>
<th>Réf</th><th>Désignation</th><th>Qte Init.</th>
${monthHeads}
<th>Qte Stock</th>
</tr></thead>
<tbody>${body || '<tr><td colspan="16">Aucune ligne</td></tr>'}</tbody>
</table>
<p class="legend"><span class="a">Vert = Achats</span> · <span class="v">Orange = Ventes</span></p>
</body></html>`;
}

function openPrintable(rows, months, annee) {
    const win = window.open('', '_blank', 'width=1200,height=700');
    if (!win) return;
    win.document.write(buildPrintHtml(rows, months, annee));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

export default function MouvementStockPage() {
    const navigate = useNavigate();
    const years = useMemo(() => yearOptions(), []);
    const [annee, setAnnee] = useState(() => new Date().getFullYear());
    const [rows, setRows] = useState([]);
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        api.get('/stock-movements', { params: { annee } })
            .then((res) => {
                setRows(res.data.data ?? []);
                setMonths(res.data.meta?.months ?? []);
            })
            .catch(() => {
                setRows([]);
                setMonths([]);
            })
            .finally(() => setLoading(false));
    }, [annee]);

    useEffect(() => { load(); }, [load]);

    const colSpan = 3 + months.length + 1;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5 text-brand-navy" />
                        Mouvement Stock
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Achats / Ventes pour chaque mois de l&apos;année — <span className="text-emerald-600 font-semibold">Achats</span> / <span className="text-orange-600 font-semibold">Ventes</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <div>
                        <label className="field-label field-label-compact">Année</label>
                        <select
                            value={annee}
                            onChange={(e) => setAnnee(Number(e.target.value))}
                            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-2 text-xs min-w-[100px]"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button type="button" onClick={load} disabled={loading} className="btn-secondary text-sm h-[34px]">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-brand-navy via-blue-800 to-blue-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Mouvement Stock {annee}</h3>
                    <span className="text-xs text-white/80">{rows.length} article(s)</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1400px]">
                        <thead>
                            <tr>
                                <th className="px-2 py-3 sticky left-0 z-10 bg-[#e8eef7] dark:bg-slate-800">Réf</th>
                                <th className="px-2 py-3 sticky left-[72px] z-10 bg-[#e8eef7] dark:bg-slate-800 min-w-[140px]">Désignation</th>
                                <th className="px-2 py-3">Qte Initiale</th>
                                {months.map((m) => (
                                    <th key={m.key} className="px-1.5 py-2 min-w-[64px]">
                                        <div>{m.label}</div>
                                        <div className="text-[8px] font-semibold tracking-normal normal-case opacity-70 mt-0.5">
                                            <span className="text-emerald-700 dark:text-emerald-400">A</span>
                                            {' / '}
                                            <span className="text-orange-700 dark:text-orange-400">V</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-2 py-3">Qte en Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(colSpan)].map((__, j) => (
                                            <td key={j} className="px-2 py-3">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[48px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-400">
                                        Aucun produit en stock
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => {
                                    const stock = Number(row.qte_stock) || 0;
                                    return (
                                        <tr key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40">
                                            <td className="px-2 py-2 font-mono text-[11px] font-semibold text-brand-navy dark:text-blue-300 sticky left-0 z-[1] bg-white dark:bg-slate-900">
                                                {row.reference}
                                            </td>
                                            <td className="px-2 py-2 text-xs font-medium text-slate-800 dark:text-white sticky left-[72px] z-[1] bg-white dark:bg-slate-900 max-w-[160px] truncate" title={row.designation}>
                                                {row.designation}
                                            </td>
                                            <td className="px-2 py-2 tabular-nums text-xs text-slate-700 dark:text-slate-200">
                                                {formatQte(row.qte_initiale)}
                                            </td>
                                            {months.map((m) => (
                                                <td key={m.key} className="px-1 py-1.5">
                                                    <MonthCell cell={row.months?.[m.key]} />
                                                </td>
                                            ))}
                                            <td className={`px-2 py-2 tabular-nums text-xs font-bold ${stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {formatQte(row.qte_stock)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-500">
                        Légende&nbsp;: <span className="font-semibold text-emerald-600">ligne haute = Achats</span>
                        {' · '}
                        <span className="font-semibold text-orange-600">ligne basse = Ventes</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => openPrintable(rows, months, annee)}
                            disabled={!rows.length}
                            className="btn-secondary text-sm disabled:opacity-50"
                        >
                            <Printer className="w-4 h-4" /> Imprimer
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="btn-danger text-sm">
                            <XCircle className="w-4 h-4" /> Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
