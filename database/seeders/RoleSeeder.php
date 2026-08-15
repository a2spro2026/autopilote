<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'dashboard' => ['Tableau de bord', ['dashboard.view']],
            'clients' => ['Clients', ['clients.view', 'clients.create', 'clients.edit', 'clients.delete']],
            'fournisseurs' => ['Fournisseurs', ['fournisseurs.view', 'fournisseurs.create', 'fournisseurs.edit', 'fournisseurs.delete']],
            'stock' => ['Stock', ['stock.view', 'stock.create', 'stock.edit', 'stock.delete']],
            'chantiers' => ['Chantiers', ['chantiers.view', 'chantiers.create', 'chantiers.edit', 'chantiers.delete']],
            'factures_clients' => ['Factures clients', ['factures_clients.view', 'factures_clients.create', 'factures_clients.edit', 'factures_clients.delete']],
            'factures_fournisseurs' => ['Factures fournisseurs', ['factures_fournisseurs.view', 'factures_fournisseurs.create', 'factures_fournisseurs.edit', 'factures_fournisseurs.delete']],
            'reglements' => ['Règlements', ['reglements.view', 'reglements.create', 'reglements.edit', 'reglements.delete']],
            'personnel' => ['Personnel', ['personnel.view', 'personnel.create', 'personnel.edit', 'personnel.delete']],
            'avances' => ['Avances', ['avances.view', 'avances.create', 'avances.edit', 'avances.delete']],
            'utilisateurs' => ['Utilisateurs', ['utilisateurs.view', 'utilisateurs.create', 'utilisateurs.edit', 'utilisateurs.delete']],
        ];

        $allPermissions = collect();

        foreach ($modules as $module => [$label, $slugs]) {
            foreach ($slugs as $slug) {
                $allPermissions->push(Permission::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => str_replace('.', ' ', ucfirst($slug)), 'module' => $module]
                ));
            }
        }

        $roles = [
            'administrateur' => [
                'name' => 'Administrateur',
                'description' => 'Accès complet à toutes les fonctionnalités',
                'permissions' => $allPermissions->pluck('slug')->all(),
            ],
            'directeur' => [
                'name' => 'Directeur',
                'description' => 'Gestion financière et direction',
                'permissions' => [
                    'dashboard.view', 'clients.view', 'clients.create', 'clients.edit',
                    'fournisseurs.view', 'fournisseurs.create', 'fournisseurs.edit',
                    'stock.view', 'stock.create', 'stock.edit',
                    'chantiers.view', 'chantiers.create', 'chantiers.edit',
                    'factures_clients.view', 'factures_clients.create', 'factures_clients.edit',
                    'factures_fournisseurs.view', 'factures_fournisseurs.create', 'factures_fournisseurs.edit',
                    'reglements.view', 'reglements.create', 'reglements.edit',
                    'personnel.view', 'personnel.create', 'personnel.edit',
                    'avances.view', 'avances.create', 'avances.edit',
                ],
            ],
            'comptable' => [
                'name' => 'Comptable',
                'description' => 'Facturation, règlements et trésorerie',
                'permissions' => [
                    'dashboard.view',
                    'factures_clients.view', 'factures_clients.create', 'factures_clients.edit',
                    'factures_fournisseurs.view', 'factures_fournisseurs.create', 'factures_fournisseurs.edit',
                    'reglements.view', 'reglements.create', 'reglements.edit',
                    'personnel.view', 'avances.view',
                    'clients.view', 'fournisseurs.view',
                ],
            ],
            'commercial' => [
                'name' => 'Commercial',
                'description' => 'Gestion commerciale, clients et ventes',
                'permissions' => [
                    'dashboard.view',
                    'clients.view', 'clients.create', 'clients.edit',
                    'stock.view',
                    'factures_clients.view', 'factures_clients.create', 'factures_clients.edit',
                    'reglements.view',
                ],
            ],
            'caisse' => [
                'name' => 'Caisse',
                'description' => 'Caisse calculatrice, consultation stock et clients',
                'permissions' => [
                    'dashboard.view',
                    'clients.view',
                    'stock.view',
                    'reglements.view',
                ],
            ],
            'facturation' => [
                'name' => 'Facturation',
                'description' => 'Factures clients, fournisseurs et règlements',
                'permissions' => [
                    'dashboard.view',
                    'factures_clients.view', 'factures_clients.create', 'factures_clients.edit',
                    'factures_fournisseurs.view', 'factures_fournisseurs.create', 'factures_fournisseurs.edit',
                    'reglements.view', 'reglements.create', 'reglements.edit',
                    'clients.view', 'fournisseurs.view',
                ],
            ],
            'chef_chantier' => [
                'name' => 'Chef de chantier',
                'description' => 'Suivi des chantiers, besoins et affectations',
                'permissions' => [
                    'dashboard.view', 'chantiers.view', 'chantiers.edit',
                    'stock.view', 'stock.create',
                    'clients.view', 'personnel.view',
                ],
            ],
            'employe' => [
                'name' => 'Employé',
                'description' => 'Consultation limitée',
                'permissions' => ['dashboard.view', 'chantiers.view'],
            ],
            'magasinier' => [
                'name' => 'Magasinier',
                'description' => 'Gestion du stock et inventaire',
                'permissions' => ['dashboard.view', 'stock.view', 'stock.create', 'stock.edit', 'fournisseurs.view'],
            ],
            'rh' => [
                'name' => 'Ressources Humaines',
                'description' => 'Gestion du personnel et paie',
                'permissions' => ['dashboard.view', 'personnel.view', 'personnel.create', 'personnel.edit', 'avances.view', 'avances.create'],
            ],
        ];

        foreach ($roles as $slug => $data) {
            $role = Role::firstOrCreate(
                ['slug' => $slug],
                ['name' => $data['name'], 'description' => $data['description']]
            );

            $permissionIds = Permission::whereIn('slug', $data['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}
