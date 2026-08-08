import KpiCards from './KpiCards';
import DashboardTables from './DashboardTables';
import CommercialDashboard from './CommercialDashboard';
import CaisseReception from './CaisseReception';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardSection() {
    const { user } = useAuth();
    const slug = user?.role?.slug;
    const { data, loading } = useDashboard();

    if (slug === 'caisse') {
        return (
            <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
                <CaisseReception />
            </div>
        );
    }

    if (slug === 'commercial') {
        return <CommercialDashboard />;
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-4 lg:px-6 pt-3 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <KpiCards kpis={data?.kpis} stockAlerts={data?.stock_alerts} loading={loading} />
            </div>
            <div className="flex-1 overflow-auto px-4 lg:px-6 py-5">
                <DashboardTables tables={data?.tables} loading={loading} />
            </div>
        </div>
    );
}
