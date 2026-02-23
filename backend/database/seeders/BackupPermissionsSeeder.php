<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class BackupPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Backup Permissions
        $permissions = [
            'view_backups',
            'create_backups',
            'download_backups',
            'delete_backups',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Assign to Admin role
        $adminRole = Role::findOrCreate('Admin');
        $adminRole->givePermissionTo($permissions);
    }
}
