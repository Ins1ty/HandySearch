<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_priest',
        'father_name',
        'priority_contact',
        'phone',
        'email',
        'social',
        'birthday',
        'responsible_id',
        'category_id',
        'invitation_types',
        'required_invitations',
        'postal_address',
        'region',
    ];

    protected $casts = [
        'birthday' => 'date',
        'is_priest' => 'boolean',
    ];

    public function responsible()
    {
        return $this->belongsTo(Responsible::class);
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

    public function getDaysUntilBirthdayAttribute()
    {
        if (!$this->birthday) {
            return null;
        }

        $today = Carbon::today();
        $birthday = $this->birthday->copy()->year($today->year);

        if ($birthday->isPast()) {
            $birthday->addYear();
        }

        return $today->diffInDays($birthday);
    }

    public function gifts()
    {
        return $this->belongsToMany(Gift::class, 'event_contacts')
            ->withTimestamps();
    }
}
