import KpiCards, { useDashboardKpis } from './KpiCards';

export default function DashboardKpis() {
    const { kpis, loading } = useDashboardKpis();
    return <KpiCards kpis={kpis} loading={loading} />;
}
