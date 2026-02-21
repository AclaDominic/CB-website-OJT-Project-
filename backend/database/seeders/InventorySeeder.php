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
                    ['name' => 'Ballpoint Pen (Black)', 'quantity' => 5, 'threshold' => 10, 'unit' => 'pcs'],
                    ['name' => 'A4 Bond Paper', 'quantity' => 2, 'threshold' => 5, 'unit' => 'reams'],
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
                    ['name' => 'Deformed Bar 10mm', 'quantity' => 500, 'threshold' => 100, 'unit' => 'pcs'],
                    ['name' => 'Tie Wire #16', 'quantity' => 5, 'threshold' => 2, 'unit' => 'roll'],
                ]
            ],
            [
                'name' => 'Safety Gear',
                'description' => 'PPE and safety equipment',
                'items' => [
                    ['name' => 'Safety Helmet (Standard)', 'quantity' => 25, 'threshold' => 5, 'unit' => 'pcs'],
                    ['name' => 'Safety Vest (Reflective)', 'quantity' => 30, 'threshold' => 5, 'unit' => 'pcs'],
                    ['name' => 'Safety Shoes (Size 9)', 'quantity' => 2, 'threshold' => 5, 'unit' => 'pairs'], // Low stock
                    ['name' => 'First Aid Kit (Industrial)', 'quantity' => 3, 'threshold' => 2, 'unit' => 'kit'],
                ]
            ],
            [
                'name' => 'Tools & Equipment',
                'description' => 'Hand tools and power tools',
                'items' => [
                    ['name' => 'Angle Grinder 4"', 'quantity' => 4, 'threshold' => 2, 'unit' => 'unit'],
                    ['name' => 'Power Drill (Cordless)', 'quantity' => 3, 'threshold' => 2, 'unit' => 'unit'],
                    ['name' => 'Shovel (Pointed)', 'quantity' => 12, 'threshold' => 5, 'unit' => 'pcs'],
                ]
            ],
            [
                'name' => 'Machinery Parts',
                'description' => 'Spare parts and maintenance items',
                'items' => [
                    ['name' => 'Hydraulic Oil (Bucket)', 'quantity' => 10, 'threshold' => 3, 'unit' => 'pail'],
                    ['name' => 'Fuel Filter (CAT)', 'quantity' => 4, 'threshold' => 2, 'unit' => 'pcs'],
                    ['name' => 'Grease (Lithium)', 'quantity' => 15, 'threshold' => 5, 'unit' => 'tubes'],
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
