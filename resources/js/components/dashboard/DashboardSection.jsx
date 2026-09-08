import { useState } from 'react';
import { Eye, EyeOff, MapPinned } from 'lucide-react';
import KpiCards from './KpiCards';
import DashboardTables from './DashboardTables';
import ClientsMap from './ClientsMap';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardSection() {
    const { data, loading } = useDashboard();
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-3 sm:px-4 lg:px-6 pt-2 sm:pt-3 pb-3 sm:pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
                        <MapPinned className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">
                            {showMap ? 'Carte clients' : 'Tableaux de bord'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowMap((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-900/20 transition-all touch-target shrink-0"
                    >
                        {showMap ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                Masquer
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Afficher
                            </>
                        )}
                    </button>
                </div>
                <KpiCards kpis={data?.kpis} loading={loading} />
            </div>
            <div className="flex-1 overflow-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-5 page-scroll">
                {showMap ? (
                    <ClientsMap />
                ) : (
                    <DashboardTables tables={data?.tables} loading={loading} />
                )}
            </div>
        </div>
    );
}
