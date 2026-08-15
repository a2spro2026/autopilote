<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $roles = [
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
        ];

        foreach ($roles as $slug => $roleData) {
            DB::table('roles')->updateOrInsert(
                ['slug' => $slug],
                [
                    'name' => $roleData['name'],
                    'description' => $roleData['description'],
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );

            $roleId = DB::table('roles')->where('slug', $slug)->value('id');
            $permissionIds = DB::table('permissions')
                ->whereIn('slug', $roleData['permissions'])
                ->pluck('id');

            foreach ($permissionIds as $permissionId) {
                DB::table('permission_role')->insertOrIgnore([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }

        if (! DB::table('users')->where('email', 'admin@socimpro.com')->exists()) {
            DB::table('users')
                ->whereIn('email', ['admin@batixpert.ma', 'admin@batixpert.com'])
                ->update(['email' => 'admin@socimpro.com']);
        }
    }

    public function down(): void
    {
        $roleIds = DB::table('roles')
            ->whereIn('slug', ['commercial', 'facturation'])
            ->pluck('id');

        DB::table('permission_role')->whereIn('role_id', $roleIds)->delete();
        DB::table('roles')->whereIn('id', $roleIds)->delete();

        if (! DB::table('users')->where('email', 'admin@batixpert.com')->exists()) {
            DB::table('users')
                ->where('email', 'admin@socimpro.com')
                ->update(['email' => 'admin@batixpert.com']);
        }
    }
};
