<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Illuminate\Support\Facades\Schema::dropIfExists('procurement_items');
    Illuminate\Support\Facades\Schema::dropIfExists('procurement_requests');
    echo "Conflicting tables dropped successfully.\n";
} catch (\Exception $e) {
    echo "Error dropping: " . $e->getMessage() . "\n";
}
