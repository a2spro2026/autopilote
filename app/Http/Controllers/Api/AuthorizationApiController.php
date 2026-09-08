<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthorizationApiController extends Controller
{
    private const LOGIN_STATUTS = [
        'administrateur' => 'Administrateur',
        'commercial' => 'Commercial',
        'caisse' => 'Caisse',
        'facturation' => 'Facturation',
    ];

    /** Menu tree mirrored from SPA navigation (sections + sous-menus). */
    private const MENU_TREE = [
        [
            'key' => 'dashboard',
            'label' => 'Tableau de Bord',
            'children' => [],
        ],
        [
            'key' => 'caisse',
            'label' => 'Caisse',
            'children' => [
                ['key' => '/caisse', 'label' => 'Caisse Calculatrice'],
            ],
        ],
        [
            'key' => 'tableau-bon-vente',
            'label' => 'Tableau Bon de Vente',
            'children' => [
                ['key' => '/tableau-bon-de-vente', 'label' => 'Tableau Bon de Vente'],
            ],
        ],
        [
            'key' => 'fournisseurs',
            'label' => 'Fournisseur',
            'children' => [
                ['key' => '/fournisseurs/fiches', 'label' => 'Fiche Fournisseur'],
                ['key' => '/fournisseurs/bons-achats', 'label' => 'Bon Achats'],
                ['key' => '/chantiers/bons-commande', 'label' => 'Bon de Commande'],
                ['key' => '/fournisseurs/reglements-achats', 'label' => 'Règlement Achats'],
                ['key' => '/fournisseurs/balance', 'label' => 'Balance'],
                ['key' => '/fournisseurs/releve-compte', 'label' => 'Relevé Compte'],
            ],
        ],
        [
            'key' => 'clients',
            'label' => 'Client',
            'children' => [
                ['key' => '/clients/fiches', 'label' => 'Fiche Client'],
                ['key' => '/clients/bons-de-vente', 'label' => 'Bon Commercial'],
                ['key' => '/clients/bons-vente', 'label' => 'Bon Livraison'],
                ['key' => '/clients/reglements-vente', 'label' => 'Règlement Client'],
                ['key' => '/clients/balance', 'label' => 'Balance Clients'],
                ['key' => '/clients/releve-compte', 'label' => 'Relevé Compte Client'],
            ],
        ],
        [
            'key' => 'facturation',
            'label' => 'Facturation',
            'children' => [
                ['key' => '/facturation/factures-achats', 'label' => 'Facture Achats'],
                ['key' => '/facturation/mouvement-fiscal', 'label' => 'Mouvement Fiscal'],
                ['key' => '/facturation/factures-ventes', 'label' => 'Facture Ventes'],
                ['key' => '/facturation/reglements', 'label' => 'Règlements'],
                ['key' => '/facturation/balance', 'label' => 'Balance'],
            ],
        ],
        [
            'key' => 'stock',
            'label' => 'Stock',
            'children' => [
                ['key' => '/stock/produits', 'label' => 'Fiche Produit'],
                ['key' => '/stock/entrepots', 'label' => 'Entrepôts'],
                ['key' => '/stock/mouvements', 'label' => 'Mouvement Stock'],
            ],
        ],
        [
            'key' => 'chantiers',
            'label' => 'Chantiers',
            'children' => [
                ['key' => '/chantiers/carte', 'label' => 'Carte Chantiers'],
                ['key' => '/clients/devis', 'label' => 'Devis'],
                ['key' => '/clients/bons-vente', 'label' => "Bon D'Execution"],
                ['key' => '/chantiers/suivi-depenses', 'label' => 'Suivi Dépenses'],
            ],
        ],
        [
            'key' => 'personnel',
            'label' => 'Personnel',
            'children' => [
                ['key' => '/personnel/fiches', 'label' => 'Fiche Personnel'],
                ['key' => '/personnel/salaires', 'label' => 'Salaire'],
                ['key' => '/personnel/etat-paiement', 'label' => 'État Paiement'],
            ],
        ],
        [
            'key' => 'monetaire',
            'label' => 'Suivi Monétaire',
            'children' => [
                ['key' => '/monetaire/transactions', 'label' => 'Transaction et Charges'],
                ['key' => '/monetaire/charges', 'label' => 'Charge'],
                ['key' => '/monetaire/tresorerie', 'label' => 'Rapport Trésorerie'],
            ],
        ],
        [
            'key' => 'configuration',
            'label' => 'Configuration',
            'children' => [
                ['key' => '/configuration/utilisateurs', 'label' => 'Utilisateur'],
                ['key' => '/configuration/autorisations', 'label' => 'Autorisation'],
            ],
        ],
    ];

    public function meta()
    {
        $users = User::with('role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => $this->formatUserSummary($u));

        return response()->json([
            'users' => $users,
            'sections' => self::MENU_TREE,
        ]);
    }

    public function show(User $user)
    {
        $user->load('role');

        return response()->json([
            'user' => $this->formatUserSummary($user),
            'menu_access' => $user->menu_access ?? $this->defaultKeysForUser($user),
            'sections' => self::MENU_TREE,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'menu_access' => 'required|array',
            'menu_access.*' => 'string|max:120',
        ]);

        $allowed = $this->allMenuKeys();
        $keys = collect($validated['menu_access'])
            ->filter(fn ($k) => in_array($k, $allowed, true))
            ->unique()
            ->values()
            ->all();

        $user->update(['menu_access' => $keys]);

        return response()->json([
            'user' => $this->formatUserSummary($user->fresh()->load('role')),
            'menu_access' => $keys,
            'message' => 'Autorisations enregistrées',
        ]);
    }

    private function formatUserSummary(User $user): array
    {
        $slug = $user->role?->slug;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'statut' => self::LOGIN_STATUTS[$slug] ?? ($user->role?->name ?: '—'),
            'statut_slug' => $slug && isset(self::LOGIN_STATUTS[$slug]) ? $slug : '',
            'is_active' => (bool) $user->is_active,
            'is_admin' => $user->isAdmin(),
        ];
    }

    private function allMenuKeys(): array
    {
        $keys = [];
        foreach (self::MENU_TREE as $section) {
            $keys[] = $section['key'];
            foreach ($section['children'] as $child) {
                $keys[] = $child['key'];
            }
        }

        return $keys;
    }

    private function defaultKeysForUser(User $user): array
    {
        if ($user->isAdmin()) {
            return $this->allMenuKeys();
        }

        $permMap = [
            'dashboard.view' => ['dashboard'],
            'fournisseurs.view' => ['fournisseurs'],
            'clients.view' => ['clients'],
            'factures_clients.view' => ['facturation'],
            'stock.view' => ['stock'],
            'chantiers.view' => ['chantiers'],
            'personnel.view' => ['personnel'],
            'reglements.view' => ['monetaire'],
            'utilisateurs.view' => ['configuration'],
        ];

        $user->loadMissing('role.permissions');
        $perms = $user->role?->permissions->pluck('slug')->all() ?? [];
        $sectionKeys = [];

        foreach ($permMap as $perm => $keys) {
            if (in_array($perm, $perms, true) || $user->isAdmin()) {
                $sectionKeys = array_merge($sectionKeys, $keys);
            }
        }

        $sectionKeys = array_unique($sectionKeys);
        $result = [];

        foreach (self::MENU_TREE as $section) {
            if (! in_array($section['key'], $sectionKeys, true)) {
                continue;
            }
            $result[] = $section['key'];
            foreach ($section['children'] as $child) {
                $result[] = $child['key'];
            }
        }

        return $result;
    }
}
