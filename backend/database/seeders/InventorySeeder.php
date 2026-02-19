<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Office Supplies',
                'description' => 'Pens, paper, staplers, etc.',
                'items' => [
                    ['name' => 'Ballpoint Pen (Black)', 'quantity' => 50, 'threshold' => 10, 'unit' => 'pcs'],
                    ['name' => 'A4 Bond Paper', 'quantity' => 20, 'threshold' => 5, 'unit' => 'reams'],
                    ['name' => 'Stapler Wire #35', 'quantity' => 5, 'threshold' => 2, 'unit' => 'box'],
                ]
            ],
            [
                'name' => 'Printer Ink',
                'description' => 'Ink bottles and cartridges',
                'items' => [
                    ['name' => 'Epson 003 Black', 'quantity' => 3, 'threshold' => 5, 'unit' => 'bottles'], // Low stock example
                    ['name' => 'Epson 003 Cyan', 'quantity' => 8, 'threshold' => 5, 'unit' => 'bottles'],
                ]
            ],
            [
                'name' => 'Hardware',
                'description' => 'Construction consumables',
                'items' => [
                    ['name' => 'Cement (40kg)', 'quantity' => 100, 'threshold' => 20, 'unit' => 'bags'],
                    ['name' => 'Plywood 1/4"', 'quantity' => 15, 'threshold' => 10, 'unit' => 'sheets'],
                ]
            ]
        ];

        foreach ($categories as $catData) {
            $items = $catData['items'];
            unset($catData['items']);

            $category = \App\Models\InventoryCategory::create($catData);

            foreach ($items as $itemData) {
                \App\Models\InventoryItem::create(array_merge($itemData, [
                    'category_id' => $category->id
                ]));

                // Optional: Create initial transaction?
                // For seeding, maybe just setting quantity is enough, or we can add transaction to be thorough.
                \App\Models\InventoryTransaction::create([
                    'inventory_item_id' => \App\Models\InventoryItem::where('name', $itemData['name'])->first()->id,
                    'type' => 'initial',
                    'quantity' => $itemData['quantity'],
                    'remarks' => 'Seeded Data'
                ]);
            }
        }
    }
}
