import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CatalogueCartProvider } from './contexts/CatalogueCartContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const BonAchatsPage = lazy(() => import('./pages/BonAchatsPage'));
const BonVentesPage = lazy(() => import('./pages/BonVentesPage'));
const ReglementFournisseurPage = lazy(() => import('./pages/ReglementFournisseurPage'));
const ReglementClientPage = lazy(() => import('./pages/ReglementClientPage'));
const ReglementFactureVentePage = lazy(() => import('./pages/ReglementFactureVentePage'));
const FicheProduitPage = lazy(() => import('./pages/FicheProduitPage'));
const CataloguePage = lazy(() => import('./pages/CataloguePage'));
const ConfigCataloguePage = lazy(() => import('./pages/ConfigCataloguePage'));
const GenericListPage = lazy(() => import('./pages/GenericListPage'));
const StockMouvementsPage = lazy(() => import('./pages/StockMouvementsPage'));
const MouvementFiscalPage = lazy(() => import('./pages/MouvementFiscalPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const FicheFournisseurPage = lazy(() => import('./pages/FicheFournisseurPage'));
const FicheClientPage = lazy(() => import('./pages/FicheClientPage'));
const FichePersonnelPage = lazy(() => import('./pages/FichePersonnelPage'));
const SalairePage = lazy(() => import('./pages/SalairePage'));
const EtatPaiementPage = lazy(() => import('./pages/EtatPaiementPage'));
const ClientBalancePage = lazy(() => import('./pages/clients/ClientBalancePage'));
const DevisListPage = lazy(() => import('./pages/devis/DevisListPage'));
const DevisFormPage = lazy(() => import('./pages/devis/DevisFormPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const RapportTresoreriePage = lazy(() => import('./pages/RapportTresoreriePage'));
const ChargesPage = lazy(() => import('./pages/ChargesPage'));
const FactureAchatsPage = lazy(() => import('./pages/FactureAchatsPage'));
const UtilisateursPage = lazy(() => import('./pages/UtilisateursPage'));
const ChauffeursPage = lazy(() => import('./pages/ChauffeursPage'));
const SupplierBalancePage = lazy(() => import('./pages/SupplierBalancePage'));
const SupplierRelevePage = lazy(() => import('./pages/SupplierRelevePage'));

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

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Fournisseur */}
                <Route path="fournisseurs/fiches" element={<FicheFournisseurPage />} />
                <Route path="fournisseurs/bons-achats" element={<BonAchatsPage />} />
                <Route path="fournisseurs/balance" element={<SupplierBalancePage />} />
                <Route path="fournisseurs/releve-compte" element={<SupplierRelevePage />} />
                <Route path="fournisseurs/reglements-achats" element={<ReglementFournisseurPage />} />

                {/* Client */}
                <Route path="clients/fiches" element={<FicheClientPage />} />
                <Route path="clients/bons-de-vente" element={<BonVentesPage mode="commercial" />} />
                <Route path="clients/devis/nouveau" element={<DevisFormPage />} />
                <Route path="clients/devis/:id" element={<DevisFormPage />} />
                <Route path="clients/devis" element={<DevisListPage />} />
                <Route path="clients/bons-vente" element={<BonVentesPage mode="livraison" />} />
                <Route path="clients/reglements-vente" element={<ReglementClientPage />} />
                <Route path="clients/reglements" element={<ReglementClientPage />} />
                <Route path="clients/factures-ventes" element={<ModulePage />} />
                <Route path="clients/reglements-factures" element={<ModulePage />} />
                <Route path="clients/balance" element={<ClientBalancePage />} />
                <Route path="clients/releve-compte" element={<ModulePage />} />

                {/* Facturation */}
                <Route path="facturation/factures-achats" element={<FactureAchatsPage pageTitle="Factures Achats" />} />
                <Route path="facturation/mouvement-fiscal" element={<MouvementFiscalPage />} />
                <Route path="facturation/stock-fiscal" element={<Navigate to="/facturation/mouvement-fiscal" replace />} />
                <Route path="facturation/depot-a" element={<Navigate to="/facturation/factures-achats" replace />} />
                <Route path="facturation/depot-b" element={<Navigate to="/facturation/factures-achats" replace />} />
                <Route path="facturation/reglement" element={<ReglementFournisseurPage />} />
                <Route path="facturation/factures-ventes" element={<ModulePage />} />
                <Route path="facturation/reglements" element={<ReglementFactureVentePage />} />
                <Route path="facturation/balance" element={<ModulePage />} />

                {/* Catalogue */}
                <Route path="catalogue/config" element={<ConfigCataloguePage />} />
                <Route path="catalogue" element={<CataloguePage />} />

                {/* Stock */}
                <Route path="stock/produits" element={<FicheProduitPage />} />
                <Route path="stock/catalogue" element={<Navigate to="/catalogue" replace />} />
                <Route path="stock/mouvements" element={<StockMouvementsPage />} />
                <Route path="stock/fiscal" element={<Navigate to="/facturation/mouvement-fiscal" replace />} />

                {/* Personnel */}
                <Route path="personnel/fiches" element={<FichePersonnelPage />} />
                <Route path="personnel/salaires" element={<SalairePage />} />
                <Route path="personnel/etat-paiement" element={<EtatPaiementPage />} />

                {/* Suivi Monétaire */}
                <Route path="monetaire/transactions" element={<TransactionsPage />} />
                <Route path="monetaire/charges" element={<ChargesPage />} />
                <Route path="monetaire/salaires" element={<Navigate to="/personnel/salaires" replace />} />
                <Route path="monetaire/tresorerie" element={<RapportTresoreriePage />} />

                {/* Configuration */}
                <Route path="configuration/utilisateurs" element={<UtilisateursPage />} />
                <Route path="configuration/chauffeurs" element={<ChauffeursPage />} />

                {/* Redirections anciennes routes Autopilote */}
                <Route path="caisse" element={<Navigate to="/dashboard" replace />} />
                <Route path="tableau-bon-de-vente" element={<Navigate to="/clients/bons-de-vente" replace />} />
                <Route path="chantiers/*" element={<Navigate to="/dashboard" replace />} />
                <Route path="configuration/autorisations" element={<Navigate to="/configuration/utilisateurs" replace />} />
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
                    <CatalogueCartProvider>
                        <Suspense fallback={<PageLoader />}>
                            <AppRoutes />
                        </Suspense>
                    </CatalogueCartProvider>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
