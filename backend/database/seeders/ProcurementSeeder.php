<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProcurementRequest;
use App\Models\ProcurementItem;
use App\Models\User;
use App\Models\Project;
use Carbon\Carbon;

class ProcurementSeeder extends Seeder
{
    public function run()
    {
        $admin = User::where('email', 'admin@gmail.com')->first();
        $projects = Project::all();

        if ($projects->isEmpty()) {
            return;
        }

        // 1. Pending Request for Project A
        $req1 = ProcurementRequest::create([
            'project_id' => $projects->first()->id,
            'user_id' => $admin->id,
            'status' => 'submitted', // Matches STATUS_SUBMITTED
            'remarks' => 'Urgent materials for foundation work.',
            'created_at' => Carbon::now()->subDays(2),
        ]);

        ProcurementItem::create([
            'procurement_request_id' => $req1->id,
            'name' => 'Portland Cement',
            'quantity' => 500,
            'unit' => 'bags',
            'notes' => 'Type 1 preferred'
        ]);

        ProcurementItem::create([
            'procurement_request_id' => $req1->id,
            'name' => '10mm Rebar',
            'quantity' => 200,
            'unit' => 'pcs',
            'notes' => 'Standard length'
        ]);

        // 2. Approved (Processing) Request for Project B
        if ($projects->count() > 1) {
            $req2 = ProcurementRequest::create([
                'project_id' => $projects->get(1)->id,
                'user_id' => $admin->id,
                'status' => 'processing', // Matches STATUS_PROCESSING
                'remarks' => 'Safety gear for new hires.',
                'supplier_notes' => 'Approved by Engr. John. PO #12345 issued.',
                'expected_arrival_date' => Carbon::now()->addDays(3),
                'created_at' => Carbon::now()->subDays(5),
            ]);

            ProcurementItem::create([
                'procurement_request_id' => $req2->id,
                'name' => 'Hard Hat (White)',
                'quantity' => 20,
                'unit' => 'pcs',
            ]);

            ProcurementItem::create([
                'procurement_request_id' => $req2->id,
                'name' => 'Safety Vest (Reflective)',
                'quantity' => 20,
                'unit' => 'pcs',
            ]);
        }

        // 3. Completed Request
        $req3 = ProcurementRequest::create([
            'project_id' => $projects->first()->id,
            'user_id' => $admin->id,
            'status' => 'completed',
            'remarks' => 'Office supplies replenishment.',
            'supplier_notes' => 'Delivered on time.',
            'expected_arrival_date' => Carbon::now()->subDays(10),
            'created_at' => Carbon::now()->subMonth(),
        ]);

        ProcurementItem::create([
            'procurement_request_id' => $req3->id,
            'name' => 'Bond Paper A4',
            'quantity' => 50,
            'unit' => 'reams',
        ]);

        // 4. Rejected Request
        $req4 = ProcurementRequest::create([
            'project_id' => $projects->last()->id,
            'user_id' => $admin->id,
            'status' => 'rejected',
            'remarks' => 'Requesting new laptop for site engineer.',
            'supplier_notes' => 'Budget constraints. Use existing equipment.',
            'created_at' => Carbon::now()->subDays(1),
        ]);

        ProcurementItem::create([
            'procurement_request_id' => $req4->id,
            'name' => 'MacBook Pro M3',
            'quantity' => 1,
            'unit' => 'unit',
        ]);
    }
}
