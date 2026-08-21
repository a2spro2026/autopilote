import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Truck } from 'lucide-react';
import api from '../lib/api';

const columns = ['ID', 'Nom Chauffeur', 'Matricule'];

export default function ChauffeursPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        api.get('/chauffeurs')
            .then((r) => setRows(r.data.data ?? []))
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chauffeur</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Chauffeurs et matricules saisis sur les bons d&apos;achats
                    </p>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-card border border-slate-200/60 dark:border-slate-700/60">
                <div className="px-5 py-3.5 bg-gradient-to-r from-slate-700 via-slate-800 to-brand-navy border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-white/80" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Liste des Chauffeurs</h3>
                    </div>
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        title="Actualiser"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
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
                                        {[...Array(3)].map((__, j) => (
                                            <td key={j} className="px-4 py-3 text-center">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto max-w-[100px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length ? (
                                rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-2.5 text-center font-mono text-xs font-semibold text-brand-navy dark:text-orange-400">
                                            {row.id}
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-medium text-slate-800 dark:text-white">
                                            {row.nom || '—'}
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                                            {row.matricule || '—'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-12 text-center text-slate-400">
                                        Aucun chauffeur saisi sur les bons d&apos;achats
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
