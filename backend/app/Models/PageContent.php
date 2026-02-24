<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $fillable = ['page_name', 'section_name', 'content', 'show_profile'];

    protected $casts = [
        'show_profile' => 'boolean',
    ];
}
