<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Illuminate\Support\Facades\Artisan::call('simulate:alerts', ['--count' => 1]);
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    $prev = $e->getPrevious();
    while ($prev) {
        echo "PREVIOUS: " . $prev->getMessage() . "\n";
        $prev = $prev->getPrevious();
    }
}
