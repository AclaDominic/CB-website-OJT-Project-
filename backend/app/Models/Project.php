<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $guarded = [];

    public function machineries()
    {
        return $this->hasMany(Machinery::class);
    }
    public function beforeAfters()
    {
        return $this->hasMany(ProjectBeforeAfter::class);
    }
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'year',
        'scope',
        'status',
        'is_public',
        'image',
    ];
}
