import {
    LayoutDashboard,
    Truck,
    Users,
    Package,
    UserCog,
    Landmark,
    Settings,
    SlidersHorizontal,
    CarFront,
    // Fournisseur
    Contact,
    ClipboardList,
    Banknote,
    Scale,
    ScrollText,
    // Client
    ContactRound,
    FileSignature,
    CircleDollarSign,
    Receipt,
    Wallet,
    // Stock
    Boxes,
    ArrowLeftRight,
    Archive,
    LayoutGrid,
    // Personnel
    BadgeCheck,
    CalendarCheck,
    // Monétaire
    Coins,
    Vault,
    FileText,
} from 'lucide-react';

export const navigation = [
    {
        id: 'dashboard',
        label: 'Tableau de Bord',
        icon: LayoutDashboard,
        perm: 'dashboard.view',
        to: '/dashboard',
    },
    {
        id: 'fournisseurs',
        label: 'Fournisseur',
        icon: Truck,
        perm: 'fournisseurs.view',
        children: [
            { to: '/fournisseurs/fiches', label: 'Fiche Fournisseur', icon: Contact },
            { to: '/fournisseurs/bons-achats', label: 'Bon Achats', icon: ClipboardList },
            { to: '/fournisseurs/reglements-achats', label: 'Règlement Achats', icon: Banknote },
            { to: '/fournisseurs/balance', label: 'Balance', icon: Scale },
            { to: '/fournisseurs/releve-compte', label: 'Relevé Compte', icon: ScrollText },
        ],
    },
    {
        id: 'catalogue',
        label: 'Catalogue',
        icon: LayoutGrid,
        perm: 'stock.view',
        children: [
            { to: '/catalogue', label: 'Catalogue', icon: LayoutGrid },
            { to: '/catalogue/config', label: 'Config Catalogue', icon: SlidersHorizontal },
        ],
    },
    {
        id: 'stock',
        label: 'Stock',
        icon: Package,
        perm: 'stock.view',
        children: [
            { to: '/stock/produits', label: 'Fiche Produit', icon: Boxes },
            { to: '/stock/mouvements', label: 'Mouvement Stock', icon: ArrowLeftRight },
        ],
    },
    {
        id: 'clients',
        label: 'Client',
        icon: Users,
        perm: 'clients.view',
        children: [
            { to: '/clients/fiches', label: 'Fiche Client', icon: ContactRound },
            { to: '/clients/bons-de-vente', label: 'Bon de Vente', icon: ClipboardList },
            { to: '/clients/devis', label: 'Devis', icon: FileSignature },
            { to: '/clients/reglements-vente', label: 'Règlement Client', icon: CircleDollarSign },
            { to: '/clients/balance', label: 'Balance', icon: Scale },
            { to: '/clients/releve-compte', label: 'Relevé Compte', icon: ScrollText },
        ],
    },
    {
        id: 'facturation',
        label: 'Facturation',
        icon: FileText,
        perm: 'factures_clients.view',
        locked: true,
        children: [
            { to: '/facturation/factures-achats', label: 'Factures Achats', icon: Receipt },
            { to: '/facturation/stock-fiscal', label: 'Stock Fiscale', icon: Archive },
            { to: '/facturation/factures-ventes', label: 'Facture Ventes', icon: Receipt },
            { to: '/facturation/reglements', label: 'Règlements Factures Ventes', icon: Wallet },
            { to: '/facturation/balance', label: 'Balance', icon: Scale },
        ],
    },
    {
        id: 'monetaire',
        label: 'Suivi Monétaire',
        icon: Landmark,
        perm: 'reglements.view',
        children: [
            { to: '/monetaire/transactions', label: 'Transaction et Charges', icon: ArrowLeftRight },
            { to: '/monetaire/charges', label: 'Charge', icon: Wallet },
            { to: '/monetaire/salaires', label: 'Salaire', icon: Coins },
            { to: '/monetaire/tresorerie', label: 'Trésorerie', icon: Vault },
        ],
    },
    {
        id: 'personnel',
        label: 'Personnels',
        icon: BadgeCheck,
        perm: 'personnel.view',
        locked: true,
        children: [
            { to: '/personnel/fiches', label: 'Fiche Personnel', icon: Contact },
            { to: '/personnel/etat-paiement', label: 'État Paiement', icon: CalendarCheck },
        ],
    },
    {
        id: 'configuration',
        label: 'Configuration',
        icon: Settings,
        perm: 'utilisateurs.view',
        children: [
            { to: '/configuration/utilisateurs', label: 'Utilisateur', icon: UserCog },
            { to: '/configuration/chauffeurs', label: 'Chauffeur', icon: CarFront },
        ],
    },
];
