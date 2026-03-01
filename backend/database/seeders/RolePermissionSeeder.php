<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Permissions ---

        // Inventory
        Permission::findOrCreate('inventory.view');
        Permission::findOrCreate('inventory.create');
        Permission::findOrCreate('inventory.edit');
        Permission::findOrCreate('inventory.delete');

        // CMS (Website Content)
        Permission::findOrCreate('cms.view');
        Permission::findOrCreate('cms.edit');

        // System (Users, Roles, Settings)
        Permission::findOrCreate('system.view');
        Permission::findOrCreate('system.manage_users');
        Permission::findOrCreate('system.manage_roles');

        // Projects
        Permission::findOrCreate('projects.view');
        Permission::findOrCreate('projects.create');
        Permission::findOrCreate('projects.edit');
        Permission::findOrCreate('projects.delete');

        // Procurement
        Permission::findOrCreate('procurement.view');
        Permission::findOrCreate('procurement.create');
        Permission::findOrCreate('procurement.submit');
        Permission::findOrCreate('procurement.process');
        Permission::findOrCreate('procurement.complete');
        Permission::findOrCreate('procurement.archive');
        Permission::findOrCreate('procurement.delete');

        // --- Roles ---

        // 1. Admin (Super User)
        $admin = Role::findOrCreate('Admin');
        $admin->givePermissionTo(Permission::all());

        // 2. Project Manager
        $pm = Role::findOrCreate('Project Manager');
        $pm->givePermissionTo([
            'projects.view',
            'projects.create',
            'projects.edit',
            'inventory.view',
            'inventory.create',
            'inventory.edit',
            'cms.view',
            'procurement.view',
            'procurement.create',
            'procurement.submit',
            'procurement.delete',
        ]);

        // 3. Site Engineer
        $engineer = Role::findOrCreate('Site Engineer');
        $engineer->givePermissionTo([
            'projects.view',
            'projects.edit',
            'inventory.view',
            'inventory.create', // Can request materials
            'procurement.view',
            'procurement.create',
            'procurement.submit',
            'procurement.delete',
        ]);

        // 4. Staff (General)
        $staff = Role::findOrCreate('Staff');
        $staff->givePermissionTo([
            'cms.view',
            'inventory.view', // Needed for Dashboard Low Stock
            'procurement.view',
            'procurement.process',
            'procurement.complete',
            'procurement.archive',
        ]);

        // --- Assign Roles to Existing Users ---

        // Assign 'Admin' role to user with email 'admin@gmail.com'
        $adminUser = User::where('email', 'admin@gmail.com')->first();
        if ($adminUser) {
            $adminUser->assignRole('Admin');
        }

        // Create Test Users for Demo
        $testUsers = [
            'pm@gmail.com' => 'Project Manager',
            'engineer@gmail.com' => 'Site Engineer',
            'staff@gmail.com' => 'Staff',
        ];

        foreach ($testUsers as $email => $roleName) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $roleName . ' User',
                    'password' => \Illuminate\Support\Facades\Hash::make('password'),
                    'role' => 'staff', // legacy fallback
                ]
            );
            $user->assignRole($roleName);
        }    

        // Assign roles based on the old 'role' column for other users
        $users = User::all();
        foreach ($users as $user) {
            if (!$user->hasAnyRole(Role::all())) {
                if ($user->role === 'admin') {
                    $user->assignRole('Admin');
                } else {
                    $user->assignRole('Staff');
                }
            }
        }
    }
}
