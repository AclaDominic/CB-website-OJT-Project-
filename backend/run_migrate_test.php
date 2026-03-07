<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$output = new Symfony\Component\Console\Output\BufferedOutput();
try {
    Illuminate\Support\Facades\Artisan::call('migrate', [], $output);
    echo $output->fetch();
} catch (\Throwable $e) {
    echo "MIGRATION_ERROR:\n";
    echo $e->getMessage() . "\n";
    if ($e->getPrevious()) {
        echo "PREVIOUS: " . $e->getPrevious()->getMessage() . "\n";
    }
}
