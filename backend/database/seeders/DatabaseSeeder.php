<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $executive = \App\Models\Department::create(['name' => 'Executive']);
        \App\Models\Department::create(['name' => 'HR']);
        \App\Models\Department::create(['name' => 'Engineer']);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department_id' => $executive->id,
        ]);

        $this->call([
            RolePermissionSeeder::class,
            ContentSeeder::class,
            InventorySeeder::class,
            ProcurementSeeder::class,
        ]);
    }
}
