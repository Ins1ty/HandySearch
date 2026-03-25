<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    protected $fillable = ['name', 'given_at'];

    protected $casts = [
        'given_at' => 'date',
    ];

    public function contacts()
    {
        return $this->belongsToMany(Contact::class, 'event_contacts')
            ->withTimestamps();
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_contacts')
            ->withTimestamps();
    }
}
