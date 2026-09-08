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
            <div className="shrink-0 px-4 lg:px-6 pt-3 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPinned className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium">
                            {showMap ? 'Carte géographique des clients' : 'Vue tableaux de bord'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowMap((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-900/20 transition-all"
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
            <div className="flex-1 overflow-auto px-4 lg:px-6 py-5">
                {showMap ? (
                    <ClientsMap />
                ) : (
                    <DashboardTables tables={data?.tables} loading={loading} />
                )}
            </div>
        </div>
    );
}
