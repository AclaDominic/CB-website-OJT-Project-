<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileDownloadLink extends Model
{
    protected $fillable = [
        'token',
        'is_used',
        'created_by',
    ];

    protected $casts = [
        'is_used' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
