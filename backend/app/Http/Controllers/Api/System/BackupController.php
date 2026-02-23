<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    protected $disk;
    protected $backupPath;

    public function __construct()
    {
        $this->disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $this->backupPath = config('backup.backup.name');
    }

    /**
     * List all backups
     */
    public function index()
    {
        $files = $this->disk->files($this->backupPath);
        $backups = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                $backups[] = [
                    'file_name' => basename($file),
                    'file_size' => round($this->disk->size($file) / 1048576, 2), // MB
                    'date' => date('Y-m-d H:i:s', $this->disk->lastModified($file)),
                    'download_link' => route('backups.download', ['file_name' => basename($file)]),
                ];
            }
        }

        return response()->json(array_reverse($backups));
    }

    /**
     * Start a new backup manually
     */
    public function store()
    {
        try {
            Artisan::queue('backup:run');
            return response()->json(['message' => 'Backup started and is running in the background. It will appear here shortly.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to start backup: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download a specific backup file
     */
    public function download($file_name)
    {
        $file = $this->backupPath . '/' . $file_name;

        if ($this->disk->exists($file)) {
            return $this->disk->download($file);
        }

        return response()->json(['message' => 'Backup file not found.'], 404);
    }

    /**
     * Delete a specific backup file
     */
    public function destroy($file_name)
    {
        $file = $this->backupPath . '/' . $file_name;

        if ($this->disk->exists($file)) {
            $this->disk->delete($file);
            return response()->json(['message' => 'Backup deleted successfully.'], 200);
        }

        return response()->json(['message' => 'Backup file not found.'], 404);
    }
}
