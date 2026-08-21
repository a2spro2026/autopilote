import KpiCards from './KpiCards';
import DashboardTables from './DashboardTables';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardSection() {
    const { data, loading } = useDashboard();

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-4 lg:px-6 pt-3 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <KpiCards kpis={data?.kpis} loading={loading} />
            </div>
            <div className="flex-1 overflow-auto px-4 lg:px-6 py-5">
                <DashboardTables tables={data?.tables} loading={loading} />
            </div>
        </div>
    );
}
