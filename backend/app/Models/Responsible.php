<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Responsible extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'notes'];

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }
}
