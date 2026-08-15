import { useAuth } from '../contexts/AuthContext';
import { CaisseCalculatrice } from '../components/dashboard/CommercialDashboard';
import CaisseReception from '../components/dashboard/CaisseReception';

export default function CaissePage() {
    const { user } = useAuth();
    const isCaisse = user?.role?.slug === 'caisse';

    if (isCaisse) {
        return <CaisseReception />;
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">Caisse</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Saisie vente — Date, client et articles</p>
            </div>
            <CaisseCalculatrice />
        </div>
    );
}
