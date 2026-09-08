import { FileSpreadsheet } from 'lucide-react';

function formatMontant(value) {
    const n = Number(value) || 0;
    return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReportTable({
    title,
    icon: Icon,
    columns,
    rows,
    loading,
    accent = 'from-brand-navy to-blue-700',
    showCount = true,
}) {
    return (
        <div className="report-table rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
            <div className={`flex items-center justify-between gap-3 px-3 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r ${accent}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && <Icon className="w-5 h-5 text-white shrink-0" strokeWidth={2} />}
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide truncate">{title}</h3>
                </div>
                {showCount && (
                    <span className="text-[10px] font-semibold text-white/80 bg-white/15 px-2 py-1 rounded-full shrink-0">
                        {loading ? '…' : `${rows?.length ?? 0} ligne(s)`}
                    </span>
                )}
            </div>

            <div className="overflow-x-auto overscroll-x-contain table-scroll-x">
                <table className="w-full text-sm min-w-[520px] sm:min-w-[640px]">
                    <thead>
                        <tr className="table-head-row border-b-2 border-slate-300/80 dark:border-slate-600">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3.5 whitespace-nowrap"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : rows?.length ? (
                            rows.map((row, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-orange-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-2.5 text-slate-700 dark:text-slate-300 ${
                                                col.align === 'right' ? 'text-right font-semibold tabular-nums' : 'text-center'
                                            }`}
                                        >
                                            {col.render ? col.render(row[col.key], row) : (
                                                col.key === 'montant' ? (
                                                    <span className="text-brand-navy dark:text-orange-400 font-semibold">
                                                        {formatMontant(row[col.key])}
                                                    </span>
                                                ) : col.key === 'destination' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        {row[col.key]}
                                                    </span>
                                                ) : (
                                                    row[col.key] ?? '—'
                                                )
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    Aucune donnée disponible
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
