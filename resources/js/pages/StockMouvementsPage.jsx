import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import { FileText, Printer, RefreshCw } from 'lucide-react';
import api from '../lib/api';

function formatQty(value) {
    const n = Number(value) || 0;
    if (Math.abs(n) < 0.0005) return '—';
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 3 });
}

function formatQtyStrict(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 });
}

function qtyClass(value, tone) {
    const empty = Math.abs(Number(value) || 0) < 0.0005;
    if (empty) return 'text-slate-300 dark:text-slate-600';
    return tone === 'achat'
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-rose-700 dark:text-rose-400';
}

function buildPrintHtml(row, year, months, printTitle = 'Mouvement Stock') {
    const monthHeads = months.map((m) => `<th colspan="2">${m.full}</th>`).join('');
    const subHeads = months.map(() => '<th>Achat</th><th>Vente</th>').join('');
    const monthCells = months.map((m) => {
        const data = row.months?.[m.num] || { achat: 0, vente: 0 };
        return `<td style="text-align:center;color:#047857">${formatQtyStrict(data.achat)}</td>
            <td style="text-align:center;color:#be123c">${formatQtyStrict(data.vente)}</td>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mouvement ${row.reference || ''}</title>
<style>
body{font-family:Arial,sans-serif;padding:28px;color:#1e293b}
h1{color:#1e3a5f;font-size:20px;margin:0 0 4px}
.sub{color:#64748b;font-size:12px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{border:1px solid #e2e8f0;padding:7px 6px;font-size:11px}
th{background:#f1f5f9;font-weight:700;text-align:center}
.badge{background:#dbeafe;color:#1e3a5f;padding:3px 8px;border-radius:999px;font-weight:700;font-size:11px}
</style></head><body>
<h1>Autopilote — ${printTitle}</h1>
<p class="sub">Année ${year} · <span class="badge">${row.reference || '—'}</span></p>
<table>
<tr>
<th rowspan="2">Réf</th><th rowspan="2">Stock Initial</th>
${monthHeads}
<th rowspan="2">Stock Actuel</th>
</tr>
<tr>${subHeads}</tr>
<tr>
<td style="text-align:center;font-family:monospace;font-weight:700">${row.reference || '—'}</td>
<td style="text-align:center;font-weight:700">${formatQtyStrict(row.stock_initial)}</td>
${monthCells}
<td style="text-align:center;font-weight:700;color:#1e3a5f">${formatQtyStrict(row.stock_actuel)}</td>
</tr>
</table>
</body></html>`;
}

function openPrintable(row, year, months, printTitle) {
    const w = window.open('', '_blank', 'width=1200,height=700');
    if (!w) return;
    w.document.write(buildPrintHtml(row, year, months, printTitle));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
}

function ActionBtn({ title, icon: Icon, color = 'slate', onClick }) {
    const colors = {
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        orange: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400',
    };
    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

function FragmentMonthSubHeads({ even }) {
    const bg = even
        ? 'bg-white dark:bg-slate-900'
        : 'bg-slate-50 dark:bg-slate-800/50';

    return (
        <>
            <th className={`px-1 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-center border-b border-slate-200 dark:border-slate-700 ${bg}`}>
                A
            </th>
            <th className={`px-1 py-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 text-center border-b border-r border-slate-200 dark:border-slate-700 ${bg}`}>
                V
            </th>
        </>
    );
}

export default function StockMouvementsPage({
    title = 'Mouvement Stock',
    subtitle = 'Achats et ventes mensuels par produit',
    printTitle = 'Mouvement Stock',
}) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [rows, setRows] = useState([]);
    const [monthsMeta, setMonthsMeta] = useState([]);
    const [loading, setLoading] = useState(true);

    const yearOptions = useMemo(() => {
        const list = [];
        for (let y = currentYear; y >= currentYear - 5; y--) list.push(y);
        return list;
    }, [currentYear]);

    const load = useCallback(() => {
        setLoading(true);
        api.get('/stock-mouvements', { params: { year } })
            .then((r) => {
                setRows(r.data.data ?? []);
                setMonthsMeta(r.data.meta?.months ?? []);
            })
            .catch(() => {
                setRows([]);
                setMonthsMeta([]);
            })
            .finally(() => setLoading(false));
    }, [year]);

    useEffect(() => {
        load();
    }, [load]);

    const colCount = 2 + monthsMeta.length * 2 + 2;

    return (
        <div className="space-y-4 h-full min-h-0 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subtitle} — {year}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-3 mr-2 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Achat
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Vente
                        </span>
                    </div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Année</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange/30"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Actualiser"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                <div className="shrink-0 px-5 py-3 bg-gradient-to-r from-brand-navy via-zinc-900 to-slate-800 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                        Tableau des mouvements
                    </h3>
                </div>

                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-sm border-collapse min-w-[1280px]">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-100 dark:bg-slate-800">
                                <th
                                    rowSpan={2}
                                    className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 text-center whitespace-nowrap sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 align-middle"
                                >
                                    Réf
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 text-center whitespace-nowrap border-b border-r border-slate-200 dark:border-slate-700 align-middle"
                                >
                                    Stock<br />Initial
                                </th>
                                {monthsMeta.map((m, i) => (
                                    <th
                                        key={m.num}
                                        colSpan={2}
                                        title={m.full}
                                        className={`px-1 py-2 text-center border-b border-slate-200 dark:border-slate-700 ${
                                            i % 2 === 0
                                                ? 'bg-slate-100 dark:bg-slate-800'
                                                : 'bg-slate-50 dark:bg-slate-800/70'
                                        }`}
                                    >
                                        <span className="inline-block text-[11px] font-bold tracking-wide text-brand-navy dark:text-orange-300 border-b-2 border-brand-orange pb-0.5">
                                            {m.short}
                                        </span>
                                    </th>
                                ))}
                                <th
                                    rowSpan={2}
                                    className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 text-center whitespace-nowrap border-b border-l border-slate-200 dark:border-slate-700 align-middle"
                                >
                                    Stock<br />Actuel
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 text-center whitespace-nowrap border-b border-slate-200 dark:border-slate-700 align-middle"
                                >
                                    Actions
                                </th>
                            </tr>
                            <tr className="bg-white dark:bg-slate-900">
                                {monthsMeta.map((m, i) => (
                                    <FragmentMonthSubHeads key={m.num} even={i % 2 === 0} />
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                        {[...Array(colCount || 28)].map((__, j) => (
                                            <td key={j} className="px-2 py-3 text-center">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[48px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row, rowIdx) => (
                                    <tr
                                        key={row.id}
                                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-orange-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                                            rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-900/60'
                                        }`}
                                    >
                                        <td className="px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-orange-300 sticky left-0 z-10 bg-inherit border-r border-slate-100 dark:border-slate-800" title={row.designation || ''}>
                                            {row.reference}
                                        </td>
                                        <td className="px-2 py-2.5 text-center tabular-nums text-xs font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                                            {formatQty(row.stock_initial)}
                                        </td>
                                        {monthsMeta.map((m, i) => {
                                            const cell = row.months?.[m.num] || { achat: 0, vente: 0 };
                                            const stripe = i % 2 === 0 ? '' : 'bg-slate-50/90 dark:bg-slate-800/25';
                                            return (
                                                <Fragment key={`${row.id}-${m.num}`}>
                                                    <td className={`px-1.5 py-2.5 text-center tabular-nums text-[11px] font-semibold ${stripe} ${qtyClass(cell.achat, 'achat')}`}>
                                                        {formatQty(cell.achat)}
                                                    </td>
                                                    <td className={`px-1.5 py-2.5 text-center tabular-nums text-[11px] font-semibold border-r border-slate-100 dark:border-slate-800 ${stripe} ${qtyClass(cell.vente, 'vente')}`}>
                                                        {formatQty(cell.vente)}
                                                    </td>
                                                </Fragment>
                                            );
                                        })}
                                        <td className="px-2 py-2.5 text-center tabular-nums text-sm font-bold text-brand-navy dark:text-orange-400 border-l border-slate-200 dark:border-slate-700">
                                            {formatQtyStrict(row.stock_actuel)}
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <ActionBtn
                                                    title="Imprimer"
                                                    icon={Printer}
                                                    onClick={() => openPrintable(row, year, monthsMeta, printTitle)}
                                                />
                                                <ActionBtn
                                                    title="PDF"
                                                    icon={FileText}
                                                    color="orange"
                                                    onClick={() => openPrintable(row, year, monthsMeta, printTitle)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={colCount || 28} className="px-4 py-12 text-center text-slate-400">
                                        Aucun produit enregistré
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
