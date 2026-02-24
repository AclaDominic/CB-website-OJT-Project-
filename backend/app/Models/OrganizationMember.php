<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationMember extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'role',
        'category',
        'image_path',
        'order',
        'parent_id',
    ];

    public function children()
    {
        return $this->hasMany(OrganizationMember::class, 'parent_id')->orderBy('order');
    }

    public function parent()
    {
        return $this->belongsTo(OrganizationMember::class, 'parent_id');
    }
}
