import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { CommercialPendingSales } from '../components/dashboard/CommercialDashboard';

export default function TableauBonVentePage() {
    const { user } = useAuth();
    if (user?.role?.slug !== 'commercial') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">Tableau Bon de Vente</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ventes saisies et suivies par le commercial
                </p>
            </div>
            <CommercialPendingSales />
        </div>
    );
}
