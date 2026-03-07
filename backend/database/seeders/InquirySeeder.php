<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inquiry;
use Carbon\Carbon;

class InquirySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $inquiries = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'subject' => 'Construction Equipment Rental',
                'message' => 'Hello, I would like to inquire about the rental rates for your bulldozers and excavators for a 3-month project in Manila.',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
                'archived_at' => null,
            ],
            [
                'name' => 'Sarah Schmidt',
                'email' => 's.schmidt@buildcorp.com',
                'subject' => 'Project Consultation Request',
                'message' => 'We are planning a mid-rise commercial building and are interested in your general contracting services. Can we schedule a meeting next week?',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
                'archived_at' => null,
            ],
            [
                'name' => 'Robert Chen',
                'email' => 'robert.c@logistics.net',
                'subject' => 'Supply Chain Partnership',
                'message' => 'We are a logistics firm looking to partner with construction companies for material transport. Please let us know if there is an opportunity to discuss synergys.',
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
                'archived_at' => Carbon::now()->subDays(2), // Archived
            ],
            [
                'name' => 'Emily Tan',
                'email' => 'emily.t@residential.ph',
                'subject' => 'Residential Renovation Timeline',
                'message' => 'I have a residential property in Quezon City that requires full renovation. Do you handle smaller residential projects or only commercial ones?',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
                'archived_at' => null,
            ],
            [
                'name' => 'David Ocampo',
                'email' => 'docampo@metro.gov',
                'subject' => 'Public Infrastructure Bidding',
                'message' => 'Attached are the details for the upcoming public infrastructure bidding. We invite Cliberduche to participate.',
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(30),
                'archived_at' => Carbon::now()->subDays(10), // Archived
            ],
        ];

        foreach ($inquiries as $inquiry) {
            Inquiry::create($inquiry);
        }
    }
}
