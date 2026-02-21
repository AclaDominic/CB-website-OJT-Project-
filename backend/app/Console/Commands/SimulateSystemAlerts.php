<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemAlert;

class SimulateSystemAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simulate:alerts {--count=1 : Number of each alert type to create}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate minor and critical system alerts for demo purposes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = (int) $this->option('count');

        for ($i = 0; $i < $count; $i++) {
            SystemAlert::create([
                'type' => 'minor',
                'message' => 'Simulated Minor Problem for Demo #' . ($i + 1),
                'context' => [
                    'source' => 'SimulateSystemAlerts Command',
                    'timestamp' => now()->toDateTimeString(),
                ]
            ]);

            SystemAlert::create([
                'type' => 'critical',
                'message' => 'Simulated Critical Error for Demo #' . ($i + 1),
                'context' => [
                    'source' => 'SimulateSystemAlerts Command',
                    'file' => '/app/Http/Controllers/ExampleController.php',
                    'line' => rand(10, 200),
                    'timestamp' => now()->toDateTimeString(),
                ]
            ]);
        }

        $this->info("Successfully generated {$count} minor and {$count} critical alerts for the demo.");
    }
}
