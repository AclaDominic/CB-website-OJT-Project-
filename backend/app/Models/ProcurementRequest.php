<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementRequest extends Model
{
    use HasFactory;

    // Status Constants
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'project_id',
        'user_id',
        'status',
        'remarks',
        'supplier_notes',
        'expected_arrival_date',
    ];

    protected $casts = [
        'expected_arrival_date' => 'date',
    ];

    public function items()
    {
        return $this->hasMany(ProcurementItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
