import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Printer, X, XCircle } from 'lucide-react';
import api from '../lib/api';

function formatMontant(value) {
    return (Number(value) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ActionBtn({ title, onClick, icon: Icon, color = 'slate' }) {
    const colors = {
        blue: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
        orange: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400',
        slate: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    };
    return (
        <button type="button" title={title} onClick={onClick} className={`p-1.5 rounded-lg text-slate-400 transition-colors ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
    );
}

function buildRowHtml(row) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Salaire ${row.matricule || ''}</title>
<style>
body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}
h1{color:#1e3a5f;font-size:22px;margin:0 0 8px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th,td{border:1px solid #e2e8f0;padding:10px;font-size:13px;text-align:left}
th{background:#f8fafc;width:180px;font-weight:700}
.badge{background:#fff7ed;color:#ea580c;padding:4px 10px;border-radius:999px;font-weight:700}
</style></head><body>
<h1>Autopilote — Salaire <span class="badge">${row.matricule || '—'}</span></h1>
<table>
<tr><th>ID</th><td>${row.matricule || '—'}</td></tr>
<tr><th>Nom Complet</th><td>${row.full_name || '—'}</td></tr>
<tr><th>Statut</th><td>${row.status_label || '—'}</td></tr>
<tr><th>Date Début</th><td>${row.hire_date || '—'}</td></tr>
<tr><th>Type Contrat</th><td>${row.contract_type || '—'}</td></tr>
<tr><th>Salaire</th><td><strong>${formatMontant(row.remuneration)}</strong></td></tr>
</table>
</body></html>`;
}

function buildTableHtml(rows) {
    const body = rows.map((r) => `<tr>
<td>${r.matricule || '—'}</td>
<td>${r.full_name || '—'}</td>
<td>${r.status_label || '—'}</td>
<td>${r.hire_date || '—'}</td>
<td>${r.contract_type || '—'}</td>
<td>${formatMontant(r.remuneration)}</td>
</tr>`).join('');

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Salaires</title>
<style>
body{font-family:Arial,sans-serif;padding:28px;color:#1e293b}
h1{color:#1e3a5f;font-size:22px;margin:0 0 6px}
.meta{color:#64748b;font-size:12px;margin-bottom:14px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{border:1px solid #e2e8f0;padding:8px;font-size:11px;text-align:center}
th{background:#f8fafc;font-weight:700}
</style></head><body>
<h1>Autopilote — Tableau des Salaires</h1>
<p class="meta">Édité le ${new Date().toLocaleDateString('fr-FR')}</p>
<table>
<thead><tr>
<th>ID</th><th>Nom Complet</th><th>Statut</th><th>Date Début</th><th>Type Contrat</th><th>Salaire</th>
</tr></thead>
<tbody>${body || '<tr><td colspan="6">Aucun salaire</td></tr>'}</tbody>
</table>
</body></html>`;
}

function openPrint(html) {
    const win = window.open('', '_blank', 'width=1000,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

function downloadCsv(rows, filename) {
    const header = ['ID', 'Nom Complet', 'Statut', 'Date Début', 'Type Contrat', 'Salaire'];
    const lines = [header.join(';')];
    rows.forEach((r) => {
        lines.push([
            r.matricule || '',
            r.full_name || '',
            r.status_label || '',
            r.hire_date || '',
            r.contract_type || '',
            String(Number(r.remuneration) || 0).replace('.', ','),
        ].join(';'));
    });
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function ViewModal({ row, onClose }) {
    if (!row) return null;
    const fields = [
        ['ID', row.matricule],
        ['Nom Complet', row.full_name],
        ['Statut', row.status_label],
        ['Date Début', row.hire_date],
        ['Type Contrat', row.contract_type],
        ['Salaire', formatMontant(row.remuneration)],
    ];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-800">
                    <div>
                        <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Salaire</p>
                        <h3 className="text-white font-bold">{row.full_name}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-2 text-sm">
                    {fields.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 shrink-0">{label}</span>
                            <span className="font-medium text-slate-800 dark:text-white text-right">{value || '—'}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button type="button" onClick={() => openPrint(buildRowHtml(row))} className="btn-secondary text-xs flex-1">
                        <Printer className="w-3.5 h-3.5" /> Imprimer
                    </button>
                    <button type="button" onClick={onClose} className="btn-danger text-xs flex-1">
                        <XCircle className="w-3.5 h-3.5" /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

const columns = ['ID', 'Nom Complet', 'Statut', 'Date Début', 'Type Contrat', 'Salaire', 'Actions'];

export default function SalairePage() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewRow, setViewRow] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        api.get('/employees', { params: { all: 1 } })
            .then((res) => setRows(res.data.data ?? []))
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-4">
            <ViewModal row={viewRow} onClose={() => setViewRow(null)} />

            <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={() => openPrint(buildTableHtml(rows))} className="btn-secondary text-xs">
                    <Printer className="w-3.5 h-3.5" /> Imprimer
                </button>
                <button type="button" onClick={() => navigate('/')} className="btn-danger text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Fermer
                </button>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-800 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Salaire</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[960px]">
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
                                    <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-3 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-orange-400">{row.matricule || '—'}</td>
                                        <td className="px-3 py-2.5 text-center font-medium text-slate-800 dark:text-white">{row.full_name || '—'}</td>
                                        <td className="px-3 py-2.5 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                row.status === 'actif'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {row.status_label || '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.hire_date || '—'}</td>
                                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">{row.contract_type || '—'}</td>
                                        <td className="px-3 py-2.5 text-center tabular-nums font-semibold text-emerald-700 dark:text-emerald-300">{formatMontant(row.remuneration)}</td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <ActionBtn title="Voir" icon={Eye} color="blue" onClick={() => setViewRow(row)} />
                                                <ActionBtn title="Imprimer" icon={Printer} color="slate" onClick={() => openPrint(buildRowHtml(row))} />
                                                <ActionBtn
                                                    title="Télécharger"
                                                    icon={Download}
                                                    color="orange"
                                                    onClick={() => downloadCsv([row], `salaire-${row.matricule || row.id}.csv`)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                                        Aucun salaire — ajoutez d&apos;abord une fiche personnel
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
