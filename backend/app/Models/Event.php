<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['title', 'description', 'event_date', 'invitation_type_id'];

    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function invitationType()
    {
        return $this->belongsTo(InvitationType::class);
    }

    public function contacts()
    {
        return $this->belongsToMany(Contact::class, 'event_contacts')
            ->withPivot('gift_id')
            ->withTimestamps();
    }

    public function gifts()
    {
        return $this->belongsToMany(Gift::class, 'event_contacts')
            ->withTimestamps();
    }
}
