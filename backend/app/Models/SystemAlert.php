<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemAlert extends Model
{
    protected $fillable = [
        'type',
        'message',
        'context',
        'resolved',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'context' => 'array',
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];
}
