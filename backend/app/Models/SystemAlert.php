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

    protected static function booted()
    {
        static::saved(function ($model) {
            event(new \App\Events\DashboardUpdated());
            event(new \App\Events\NotificationSent()); // also trigger notification bell just in case
        });

        static::deleted(function ($model) {
            event(new \App\Events\DashboardUpdated());
            event(new \App\Events\NotificationSent());
        });
    }
}
