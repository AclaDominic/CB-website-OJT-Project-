<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                "question" => "Company overview",
                "answer" => "Cliberduche Corporation is a premier construction and responsible land development company based in the Philippines. We are committed to delivering exceptional quality, innovation, and sustainability in every project."
            ],
            [
                "question" => "Services or products",
                "answer" => "We are your one-stop-shop for construction and land development. We provide high-quality backfill materials for land development projects and other infrastructures. To see all our services, please visit our Services page."
            ],
            [
                "question" => "Contact information",
                "answer" => "You can reach us through our digital inquiry form on the Contact Us page, where you'll also find our exact email address, mobile, and landline numbers."
            ],
            [
                "question" => "Core values",
                "answer" => "Our core values are Quality, Safety, and Integrity. We prioritize high-quality projects aligned with national standards, strict safety practices, and compliance with construction laws."
            ],
            [
                "question" => "Location",
                "answer" => "We are located in the Philippines. For our exact primary office location and a map, please visit the Contact Us page."
            ],
            [
                "question" => "Frequently asked questions",
                "answer" => "Most clients ask about our services, project timelines, and estimates. We handle projects of various scales adhering to environmental regulations. Feel free to send us a message via the Contact Us page for specific details!"
            ]
        ];

        foreach ($faqs as $faq) {
            \App\Models\Faq::create($faq);
        }
    }
}
