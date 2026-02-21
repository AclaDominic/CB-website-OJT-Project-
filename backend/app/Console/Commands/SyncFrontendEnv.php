<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncFrontendEnv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'env:sync-frontend';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync backend VITE_ variables to the frontend .env file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $backendEnvPath = base_path('.env');
        $frontendEnvPath = base_path('../frontend/.env');

        if (!file_exists($backendEnvPath)) {
            $this->error('Backend .env file not found.');
            return;
        }

        if (!file_exists($frontendEnvPath)) {
            $this->warn('Frontend .env file not found. Creating one...');
            file_put_contents($frontendEnvPath, '');
        }

        $backendEnv = file_get_contents($backendEnvPath);
        $frontendEnv = file_get_contents($frontendEnvPath);

        // Extract variables that need to be synced (all starting with VITE_)
        preg_match_all('/^(VITE_[A-Z_]+)=(.*)$/m', $backendEnv, $matches);

        if (empty($matches[0])) {
            $this->info('No VITE_ variables found in backend .env to sync.');
            return;
        }

        $syncedCount = 0;
        foreach ($matches[1] as $index => $key) {
            $value = trim($matches[2][$index]);

            // Resolve internal .env variables like "${REVERB_APP_KEY}"
            if (preg_match('/^"?\$\{([A-Z_]+)\}"?$/', $value, $refMatches)) {
                $refKey = $refMatches[1];
                if (preg_match("/^{$refKey}=(.*)$/m", $backendEnv, $valMatches)) {
                    $value = trim($valMatches[1]);
                }
            }

            // If key exists in frontend .env, replace it. Otherwise, append it.
            if (preg_match("/^{$key}=/m", $frontendEnv)) {
                $frontendEnv = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $frontendEnv);
            } else {
                $frontendEnv .= "\n{$key}={$value}";
            }
            $syncedCount++;
        }

        // Clean up any extra blank lines
        $frontendEnv = trim(preg_replace('/\n{3,}/', "\n\n", $frontendEnv)) . "\n";

        file_put_contents($frontendEnvPath, $frontendEnv);

        $this->info("Successfully synced {$syncedCount} VITE_ variables to the frontend .env file!");
    }
}
