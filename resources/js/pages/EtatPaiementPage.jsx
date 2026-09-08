import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Search, Users, Wallet, XCircle } from 'lucide-react';
import api from '../lib/api';

const MONTHS = [
    { n: 1, label: 'Jan' },
    { n: 2, label: 'Fév' },
    { n: 3, label: 'Mar' },
    { n: 4, label: 'Avr' },
    { n: 5, label: 'Mai' },
    { n: 6, label: 'Juin' },
    { n: 7, label: 'Juil' },
    { n: 8, label: 'Aoû' },
    { n: 9, label: 'Sep' },
    { n: 10, label: 'Oct' },
    { n: 11, label: 'Nov' },
    { n: 12, label: 'Déc' },
];

const emptyFilters = { matricule: '', nom: '' };

function Field({ label, children }) {
    return (
        <div className="min-w-0">
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

function SummaryCard({ label, value, gradient, glow, icon: Icon, isMoney = false }) {
    return (
        <div
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
            style={{ boxShadow: `0 10px 28px -8px ${glow}` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/85">{label}</p>
                    <p className="mt-1.5 text-lg sm:text-xl font-bold tabular-nums leading-tight">
                        {isMoney ? formatMontant(value) : (Number(value) || 0).toLocaleString('fr-FR')}
                    </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function yearOptions() {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2, y - 3, y - 4];
}

function buildPrintHtml(rows, year, summary) {
    const headMonths = MONTHS.map((m) => `<th>${m.label}</th>`).join('');
    const body = rows.map((r) => {
        const months = MONTHS.map((m) => {
            const paid = !!(r.months?.[m.n] ?? r.months?.[String(m.n)]);
            return `<td>${paid ? 'Oui' : 'Non'}</td>`;
        }).join('');
        return `<tr>
<td>${r.date || '—'}</td>
<td>${r.matricule || '—'}</td>
<td>${r.full_name || '—'}</td>
<td>${formatMontant(r.salaire)}</td>
${months}
<td><strong>${formatMontant(r.total)}</strong></td>
</tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>État Paiement ${year}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}
h1{color:#1e3a5f;font-size:20px;margin:0 0 6px}
.meta{color:#64748b;font-size:12px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{border:1px solid #e2e8f0;padding:5px;font-size:10px;text-align:center}
th{background:#f8fafc;font-weight:700}
</style></head><body>
<h1>Autopilote — État Paiement ${year}</h1>
<p class="meta">Nbr Personnel : ${summary.nbr_personnel} · Total des Salaires : ${formatMontant(summary.total_salaires)}</p>
<table>
<thead><tr>
<th>Date</th><th>ID</th><th>Nom Complet</th><th>Salaire</th>${headMonths}<th>Total</th>
</tr></thead>
<tbody>${body || '<tr><td colspan="17">Aucun personnel</td></tr>'}</tbody>
</table>
</body></html>`;
}

export default function EtatPaiementPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(emptyFilters);
    const [applied, setApplied] = useState(emptyFilters);
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ nbr_personnel: 0, total_salaires: 0 });
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(null);
    const years = useMemo(() => yearOptions(), []);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    const load = useCallback(() => {
        setLoading(true);
        const params = { year };
        if (applied.matricule) params.matricule = applied.matricule;
        if (applied.nom) params.nom = applied.nom;

        api.get('/etat-paiement', { params })
            .then((res) => {
                setRows(res.data.data ?? []);
                setSummary({
                    nbr_personnel: Number(res.data.meta?.nbr_personnel) || 0,
                    total_salaires: Number(res.data.meta?.total_salaires) || 0,
                });
            })
            .catch(() => {
                setRows([]);
                setSummary({ nbr_personnel: 0, total_salaires: 0 });
            })
            .finally(() => setLoading(false));
    }, [applied, year]);

    useEffect(() => { load(); }, [load]);

    const handleToggle = async (row, month) => {
        const key = `${row.id}-${month}`;
        const current = !!(row.months?.[month] ?? row.months?.[String(month)]);
        const next = !current;
        setToggling(key);
        setRows((prev) => prev.map((r) => {
            if (r.id !== row.id) return r;
            const months = { ...r.months, [month]: next };
            const paidCount = MONTHS.filter((m) => !!(months[m.n] ?? months[String(m.n)])).length;
            return {
                ...r,
                months,
                paid_count: paidCount,
                total: Math.round((Number(r.salaire) || 0) * paidCount * 100) / 100,
            };
        }));
        try {
            await api.patch(`/etat-paiement/${row.id}`, { year, month, paid: next });
        } catch {
            load();
        } finally {
            setToggling(null);
        }
    };

    const handlePrint = () => {
        const win = window.open('', '_blank', 'width=1400,height=800');
        if (!win) return;
        win.document.write(buildPrintHtml(rows, year, summary));
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 300);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SummaryCard
                    label="Nbr Personnel"
                    value={summary.nbr_personnel}
                    gradient="from-sky-500 via-blue-600 to-brand-navy"
                    glow="rgba(37, 99, 235, 0.4)"
                    icon={Users}
                />
                <SummaryCard
                    label="Total des Salaires"
                    value={summary.total_salaires}
                    gradient="from-emerald-500 via-green-600 to-teal-800"
                    glow="rgba(16, 185, 129, 0.4)"
                    icon={Wallet}
                    isMoney
                />
            </div>

            <div className="glass-card p-4 shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-2 sm:grid-cols-[0.8fr_1fr_1.2fr_auto] gap-2.5 items-end">
                    <Field label="Année">
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={filterClass}>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </Field>
                    <Field label="ID">
                        <input type="text" value={filters.matricule} onChange={(e) => setFilter('matricule', e.target.value)} placeholder="ID..." className={filterClass} />
                    </Field>
                    <Field label="Nom Complet">
                        <input type="text" value={filters.nom} onChange={(e) => setFilter('nom', e.target.value)} placeholder="Nom complet..." className={filterClass} />
                    </Field>
                    <button type="button" onClick={() => setApplied({ ...filters })} className="btn-secondary text-xs h-[34px] px-4 self-end">
                        <Search className="w-3.5 h-3.5" /> Rechercher
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={handlePrint} className="btn-secondary text-xs">
                    <Printer className="w-3.5 h-3.5" /> Imprimer
                </button>
                <button type="button" onClick={() => navigate('/')} className="btn-danger text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Fermer
                </button>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-700 to-slate-900 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">État Paiement — {year}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1400px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                {['Date', 'ID', 'Nom Complet', 'Salaire', ...MONTHS.map((m) => m.label), 'Total'].map((h) => (
                                    <th key={h} className="px-2 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}>{[...Array(17)].map((__, j) => (
                                        <td key={j} className="px-2 py-3 text-center">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[48px]" />
                                        </td>
                                    ))}</tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-violet-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-2 py-2 text-center text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.date || '—'}</td>
                                        <td className="px-2 py-2 text-center font-mono text-xs font-semibold text-brand-navy dark:text-orange-400 whitespace-nowrap">{row.matricule || '—'}</td>
                                        <td className="px-2 py-2 text-center font-medium text-slate-800 dark:text-white whitespace-nowrap">{row.full_name || '—'}</td>
                                        <td className="px-2 py-2 text-center tabular-nums font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">{formatMontant(row.salaire)}</td>
                                        {MONTHS.map((m) => {
                                            const paid = !!(row.months?.[m.n] ?? row.months?.[String(m.n)]);
                                            const busy = toggling === `${row.id}-${m.n}`;
                                            return (
                                                <td key={m.n} className="px-1 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => handleToggle(row, m.n)}
                                                        title={paid ? 'Payé — cliquer pour Non' : 'Non payé — cliquer pour Oui'}
                                                        className={`inline-flex min-w-[42px] justify-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                                            paid
                                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                                        } disabled:opacity-50`}
                                                    >
                                                        {paid ? 'Oui' : 'Non'}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                        <td className="px-2 py-2 text-center tabular-nums font-bold text-brand-navy dark:text-orange-400 whitespace-nowrap">{formatMontant(row.total)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={17} className="px-4 py-12 text-center text-slate-400">
                                        Aucun personnel trouvé
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
