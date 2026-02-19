<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PageContent;
use App\Models\Service;
use App\Models\Project;
use App\Models\Machinery;
use App\Models\DevelopmentSite;

class ContentSeeder extends Seeder
{
    public function run()
    {
        // 1. Page Content (About & Contact)
        $contents = [
            [
                'page_name' => 'about',
                'section_name' => 'mission',
                'content' => "We are a responsible land development company that provides high-quality backfill materials for land development projects and other infrastructures… adhering to environmental regulations of the Philippines while delivering value to our communities, partners, and stakeholders."
            ],
            [
                'page_name' => 'about',
                'section_name' => 'vision',
                'content' => "To be a highly respected, world-class natural resource land development company committed to international standards, environmental conservation, and sustainable projects."
            ],
            [
                'page_name' => 'about',
                'section_name' => 'background',
                'content' => "Established: November 28, 2018\nRegistration: Securities and Exchange Commission (SEC)\nIndustry: Construction, Land Development, Backfill Materials Supply\nOperating Areas: CALABARZON and nearby regions\n\nOrigin of Name: CLIBERDUCHE = CLImaco + BERonilla + DUCHE (Piaduche)"
            ],
            [
                'page_name' => 'contact',
                'section_name' => 'office_info',
                'content' => json_encode([
                    'address' => "Lot 3739 National Highway, 3/F CBD Building\nBrgy. Pulo, Cabuyao City, Laguna",
                    'email' => 'cliberduche.corp@yahoo.com',
                    'mobile' => '0917-123-4567',
                    'landline' => '(049) 555-1234'
                ])
            ]
        ];

        foreach ($contents as $content) {
            PageContent::updateOrCreate(
                ['page_name' => $content['page_name'], 'section_name' => $content['section_name']],
                ['content' => $content['content']]
            );
        }

        // 2. Services
        $services = [
            [
                'title' => 'Land Development',
                'description' => 'Comprehensive land development solutions including grading, excavation, and site preparation.',
                'type' => 'primary',
                'image' => 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'title' => 'Construction Supply',
                'description' => 'High-quality backfill materials and construction aggregates for all your project needs.',
                'type' => 'primary',
                'image' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'title' => 'Heavy Equipment Rental',
                'description' => 'Reliable heavy equipment fleet available for rental to support your construction operations.',
                'type' => 'primary',
                'image' => 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'title' => 'Site Clearing',
                'description' => 'Professional clearing and grubbing services for project kick-off.',
                'type' => 'secondary',
                'image' => null
            ],
            [
                'title' => 'Demolition',
                'description' => 'Safe and efficient demolition services for structures of all sizes.',
                'type' => 'secondary',
                'image' => null
            ],
            [
                'title' => 'Excavation',
                'description' => 'Precision excavation services for foundations, basements, and utilities.',
                'type' => 'secondary',
                'image' => null
            ]
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['title' => $service['title']], $service);
        }

        // 3. Projects
        $projects = [
            [
                'name' => 'Cabuyao Commercial Center',
                'location' => 'Cabuyao, Laguna',
                'year' => '2023',
                'scope' => 'Site development and foundation works.',
                'status' => 'Ongoing',
                'image' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'name' => 'Santa Rosa Heights',
                'location' => 'Santa Rosa, Laguna',
                'year' => '2022',
                'scope' => 'Road construction and drainage systems.',
                'status' => 'Completed',
                'image' => 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'name' => 'Calamba Industrial Park',
                'location' => 'Calamba, Laguna',
                'year' => '2021',
                'scope' => 'Large scale earthmoving and leveling.',
                'status' => 'Completed',
                'image' => 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ]
        ];

        foreach ($projects as $project) {
            Project::firstOrCreate(['name' => $project['name']], $project);
        }

        // 4. Machinery
        $machineries = [
            [
                'name' => 'Caterpillar 320D',
                'type' => 'Excavator',
                'plate_number' => 'CAT-001',
                'status' => 'Stand By',
                'image_url' => 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'name' => 'Komatsu D65',
                'type' => 'Bulldozer',
                'plate_number' => 'KOM-002',
                'status' => 'Active',
                'image_url' => 'https://images.unsplash.com/photo-1579407364450-481fe19dbfaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'name' => 'Isuzu Giga',
                'type' => 'Dump Truck',
                'plate_number' => 'DT-003',
                'status' => 'Lease',
                'image_url' => 'https://images.unsplash.com/photo-1591736287094-1e53b451785f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'name' => 'Hitachi Zaxis',
                'type' => 'Excavator',
                'plate_number' => 'HIT-004',
                'status' => 'Decommissioned',
                'image_url' => 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ]
        ];

        foreach ($machineries as $machinery) {
            Machinery::firstOrCreate(['name' => $machinery['name']], $machinery);
        }

        // 5. Development Sites
        $sites = [
            [
                'name' => 'Laguna Technopark Extension',
                'location' => 'Biñan, Laguna',
                'capacity' => '50,000 sqm',
                'description' => 'Industrial lot preparation and backfilling.',
                'image_url' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ],
            [
                'name' => 'Nuvali Residential Block',
                'location' => 'Santa Rosa, Laguna',
                'capacity' => '20,000 sqm',
                'description' => 'Residential subdivision grading.',
                'image_url' => 'https://images.unsplash.com/photo-1464295440335-ee082a75ccca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            ]
        ];

        foreach ($sites as $site) {
            DevelopmentSite::firstOrCreate(['name' => $site['name']], $site);
        }
    }
}
