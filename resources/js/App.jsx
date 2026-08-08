import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const ChantiersPage = lazy(() => import('./pages/ChantiersPage'));
const BonAchatsPage = lazy(() => import('./pages/BonAchatsPage'));
const BonVentesPage = lazy(() => import('./pages/BonVentesPage'));
const ReglementFournisseurPage = lazy(() => import('./pages/ReglementFournisseurPage'));
const ReglementClientPage = lazy(() => import('./pages/ReglementClientPage'));
const FicheProduitPage = lazy(() => import('./pages/FicheProduitPage'));
const GenericListPage = lazy(() => import('./pages/GenericListPage'));
const MouvementStockPage = lazy(() => import('./pages/MouvementStockPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const FicheFournisseurPage = lazy(() => import('./pages/FicheFournisseurPage'));
const FicheClientPage = lazy(() => import('./pages/FicheClientPage'));
const BonExecutionListPage = lazy(() => import('./pages/clients/BonExecutionListPage'));
const ClientBalancePage = lazy(() => import('./pages/clients/ClientBalancePage'));
const DevisListPage = lazy(() => import('./pages/devis/DevisListPage'));
const DevisFormPage = lazy(() => import('./pages/devis/DevisFormPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const ChargesPage = lazy(() => import('./pages/ChargesPage'));
const FactureAchatsPage = lazy(() => import('./pages/FactureAchatsPage'));
const UtilisateursPage = lazy(() => import('./pages/UtilisateursPage'));
const AutorisationsPage = lazy(() => import('./pages/AutorisationsPage'));
const CaissePage = lazy(() => import('./pages/CaissePage'));
const TableauBonVentePage = lazy(() => import('./pages/TableauBonVentePage'));
const SupplierBalancePage = lazy(() => import('./pages/SupplierBalancePage'));

function PageLoader() {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-3 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

const employeeCols = [
    { key: 'matricule', label: 'Matricule' },
    { key: 'name', label: 'Nom', render: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'position', label: 'Poste' },
    { key: 'monthly_salary', label: 'Salaire', render: (r) => `${r.monthly_salary}` },
    { key: 'status', label: 'Statut' },
];

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="caisse" element={<CaissePage />} />
                <Route path="tableau-bon-de-vente" element={<TableauBonVentePage />} />

                <Route path="fournisseurs/fiches" element={<FicheFournisseurPage />} />
                <Route path="fournisseurs/bons-achats" element={<BonAchatsPage />} />
                <Route path="fournisseurs/balance" element={<SupplierBalancePage />} />
                <Route path="fournisseurs/releve-compte" element={<ModulePage />} />

                <Route path="clients/fiches" element={<FicheClientPage />} />
                <Route path="clients/bons-de-vente" element={<BonVentesPage />} />
                <Route path="clients/devis/nouveau" element={<DevisFormPage />} />
                <Route path="clients/devis/:id" element={<DevisFormPage />} />
                <Route path="clients/devis" element={<DevisListPage />} />
                <Route path="clients/bons-vente" element={<BonExecutionListPage />} />
                <Route path="clients/reglements-vente" element={<ReglementClientPage />} />
                <Route path="clients/reglements" element={<ReglementClientPage />} />
                <Route path="clients/factures-ventes" element={<ModulePage />} />
                <Route path="clients/reglements-factures" element={<ModulePage />} />
                <Route path="clients/balance" element={<ClientBalancePage />} />
                <Route path="clients/releve-compte" element={<ModulePage />} />

                <Route path="facturation/factures-achats" element={<FactureAchatsPage />} />
                <Route path="facturation/depot-a" element={<FactureAchatsPage depotFilter="depot_a" pageTitle="Depot A" pageSubtitle="Factures achats — destination Depot A" />} />
                <Route path="facturation/depot-b" element={<FactureAchatsPage depotFilter="depot_b" pageTitle="Depot B" pageSubtitle="Factures achats — destination Depot B" />} />
                <Route path="facturation/reglement" element={<ReglementFournisseurPage />} />
                <Route path="facturation/factures-ventes" element={<ModulePage />} />
                <Route path="facturation/reglements" element={<ReglementClientPage />} />
                <Route path="facturation/balance" element={<ModulePage />} />
                <Route path="fournisseurs/reglements-achats" element={<ReglementFournisseurPage />} />

                <Route path="stock/produits" element={<FicheProduitPage />} />
                <Route path="stock/entrepots" element={<ModulePage />} />
                <Route path="stock/mouvements" element={<MouvementStockPage />} />

                <Route path="chantiers/carte" element={<ChantiersPage />} />
                <Route path="chantiers/bons-commande" element={<ModulePage />} />
                <Route path="chantiers/suivi-depenses" element={<ModulePage />} />

                <Route path="personnel/fiches" element={<GenericListPage title="Fiche Personnel" subtitle="Gestion des employés" endpoint="/employees" columns={employeeCols} />} />
                <Route path="personnel/etat-paiement" element={<ModulePage />} />

                <Route path="monetaire/transactions" element={<TransactionsPage />} />
                <Route path="monetaire/charges" element={<ChargesPage />} />
                <Route path="monetaire/salaires" element={<ModulePage />} />
                <Route path="monetaire/tresorerie" element={<ModulePage />} />

                <Route path="configuration/utilisateurs" element={<UtilisateursPage />} />
                <Route path="configuration/autorisations" element={<AutorisationsPage />} />

                <Route path="chantiers" element={<Navigate to="/chantiers/carte" replace />} />
                <Route path="achats" element={<Navigate to="/fournisseurs/bons-achats" replace />} />
                <Route path="stock" element={<Navigate to="/stock/produits" replace />} />
                <Route path="fournisseurs" element={<Navigate to="/fournisseurs/fiches" replace />} />
                <Route path="clients" element={<Navigate to="/clients/fiches" replace />} />
                <Route path="personnel" element={<Navigate to="/personnel/fiches" replace />} />
                <Route path="paiements" element={<Navigate to="/monetaire/tresorerie" replace />} />
                <Route path="parametres" element={<Navigate to="/configuration/utilisateurs" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter basename="/app">
                    <Suspense fallback={<PageLoader />}>
                        <AppRoutes />
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
