<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectBeforeAfter extends Model
{
    protected $fillable = [
        'project_id',
        'before_image',
        'after_image',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
