<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'description',
        'short_description',
        'full_description',
        'priority_contact',
        'phone',
        'email',
        'social',
        'birthday',
        'place_of_birth',
        'workplace',
        'position',
        'previous_workplaces',
        'responsible_id',
        'category_id',
        'invitation_types',
        'postal_address',
        'visible_only_to_admin',
        'visible_only_to_editor',
        'gifts_given',
        'region',
        'is_priest',
    ];

    protected $casts = [
        'birthday' => 'date',
    ];

    public function responsible()
    {
        return $this->belongsTo(Responsible::class);
    }

    public function responsibles()
    {
        return $this->belongsToMany(Responsible::class, 'contact_responsible');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'contact_tags');
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_contacts')
            ->withPivot('gift_id')
            ->withTimestamps();
    }

    public function gifts()
    {
        return $this->belongsToMany(Gift::class, 'event_contacts')
            ->withTimestamps();
    }
}