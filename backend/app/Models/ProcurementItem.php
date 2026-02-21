<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'procurement_request_id',
        'name',
        'quantity',
        'unit',
        'notes',
    ];

    public function request()
    {
        return $this->belongsTo(ProcurementRequest::class, 'procurement_request_id');
    }
}
