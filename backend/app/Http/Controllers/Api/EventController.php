<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Contact;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['invitationType', 'contacts', 'gifts']);

        if ($request->has('contact_id')) {
            $query->whereHas('contacts', function ($q) use ($request) {
                $q->where('contacts.id', $request->contact_id);
            });
        }

        if ($request->has('invitation_type_id')) {
            $query->where('invitation_type_id', $request->invitation_type_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $events = $query->orderBy('event_date', 'desc')->get();

        return response()->json($events);
    }

    public function getInvitableContacts(Event $event)
    {
        $event->load('invitationType');
        
        $query = Contact::with(['category', 'responsible', 'tags']);
        
        if ($event->invitationType) {
            $query->where('invitation_types', 'like', '%' . $event->invitationType->name . '%');
        }
        
        $contacts = $query->orderBy('name')->get();

        return response()->json([
            'event' => $event,
            'available_contacts' => $contacts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'invitation_type_id' => 'nullable|exists:invitation_types,id',
            'contacts' => 'nullable|array',
            'contacts.*' => 'exists:contacts,id',
            'gifts' => 'nullable|array',
            'gifts.*' => 'exists:gifts,id',
        ]);

        $event = Event::create($validated);

        if ($request->has('contacts')) {
            $pivotData = [];
            foreach ($request->contacts as $contactId) {
                $giftId = null;
                if ($request->has('gifts') && isset($request->gifts[$contactId])) {
                    $giftId = $request->gifts[$contactId];
                }
                $pivotData[$contactId] = ['gift_id' => $giftId];
            }
            $event->contacts()->sync($pivotData);
        }

        $event->load(['invitationType', 'contacts', 'gifts']);

        return response()->json($event, 201);
    }

    public function show(Event $event)
    {
        $event->load(['invitationType', 'contacts', 'gifts']);

        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'sometimes|date',
            'invitation_type_id' => 'nullable|exists:invitation_types,id',
            'contacts' => 'nullable|array',
            'contacts.*' => 'exists:contacts,id',
            'gifts' => 'nullable|array',
            'gifts.*' => 'exists:gifts,id',
        ]);

        $event->update($validated);

        if ($request->has('contacts')) {
            $pivotData = [];
            foreach ($request->contacts as $contactId) {
                $giftId = null;
                if ($request->has('gifts') && isset($request->gifts[$contactId])) {
                    $giftId = $request->gifts[$contactId];
                }
                $pivotData[$contactId] = ['gift_id' => $giftId];
            }
            $event->contacts()->sync($pivotData);
        }

        $event->load(['invitationType', 'contacts', 'gifts']);

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
