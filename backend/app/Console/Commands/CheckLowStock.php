<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckLowStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check-low-stock';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for inventory items below threshold and notify admins';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $lowStockItems = \App\Models\InventoryItem::whereColumn('quantity', '<=', 'threshold')->get();

        if ($lowStockItems->isEmpty()) {
            $this->info('No low stock items found.');
            return;
        }

        // Get users with inventory permission
        // Assuming we have a permission system, otherwise notify all admins
        // Here we'll notify users who have 'inventory.view' or similar, or just all for now if roles not fully linked to notifications
        // Let's assume we notify users with 'inventory.edit' or 'system.manage_users' as a fallback
        // Better: Notify all users who can manage inventory.

        // Use whereHas with 'roles' (plural) to avoid exceptions if a role doesn't exist
        $usersToNotify = \App\Models\User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['Super Admin', 'Admin', 'Inventory Manager']);
        })->get();

        foreach ($usersToNotify as $user) {
            $user->notify(new \App\Notifications\LowStockNotification($lowStockItems));
        }

        $this->info("Notified {$usersToNotify->count()} users about {$lowStockItems->count()} low stock items.");
    }
}
