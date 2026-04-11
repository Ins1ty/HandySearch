<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Contact::with(['category', 'responsible', 'tags']);

        if ($user->role !== 'admin') {
            $query->where('visible_only_to_admin', false);
        }
        
        if ($user->role === 'viewer') {
            $query->where('visible_only_to_editor', false);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('responsible_id')) {
            $query->where('responsible_id', $request->responsible_id);
        }

        if ($request->has('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->tag_id);
            });
        }

        if ($request->has('region')) {
            $query->where('region', 'like', "%{$request->region}%");
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('full_description', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('workplace', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'first_name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if (in_array($sortBy, ['first_name', 'middle_name', 'last_name', 'region', 'birthday', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('first_name');
        }

        $contacts = $query->get();

        return response()->json($contacts);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:255',
            'full_description' => 'nullable|string',
            'priority_contact' => 'nullable|in:call,sms,messenger,email',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'social' => 'nullable|string',
            'birthday' => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'workplace' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'previous_workplaces' => 'nullable|string',
            'responsible_id' => 'nullable|exists:responsibles,id',
            'category_id' => 'nullable|exists:categories,id',
            'invitation_types' => 'nullable|array',
            'required_invitations' => 'nullable|array',
            'postal_address' => 'nullable|string',
            'region' => 'nullable|exists:cities,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'visible_only_to_admin' => 'nullable|boolean',
            'visible_only_to_editor' => 'nullable|boolean',
            'gifts_given' => 'nullable|string',
        ]);

        $validated['invitation_types'] = $request->has('invitation_types') ? implode(',', $request->invitation_types) : null;
        $validated['required_invitations'] = $request->has('required_invitations') ? implode(',', $request->required_invitations) : null;

        if ($user->role === 'admin') {
            $validated['visible_only_to_admin'] = $request->boolean('visible_only_to_admin', false);
            $validated['visible_only_to_editor'] = $request->boolean('visible_only_to_editor', false);
        } elseif ($user->role === 'editor') {
            $validated['visible_only_to_admin'] = false;
            $validated['visible_only_to_editor'] = $request->boolean('visible_only_to_editor', false);
        } else {
            $validated['visible_only_to_admin'] = false;
            $validated['visible_only_to_editor'] = false;
        }

        $contact = Contact::create($validated);

        if ($request->has('tags')) {
            $contact->tags()->sync($request->tags);
        }

        $contact->load(['category', 'responsible', 'tags']);

        return response()->json($contact, 201);
    }

    public function show(Contact $contact)
    {
        $user = Auth::user();
        
        if ($contact->visible_only_to_admin && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        if ($contact->visible_only_to_editor && $user->role === 'viewer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $contact->load(['category', 'responsible', 'tags', 'events', 'gifts']);

        return response()->json($contact);
    }

    public function update(Request $request, Contact $contact)
    {
        $user = Auth::user();
        
        if ($contact->visible_only_to_admin && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        if ($contact->visible_only_to_editor && $user->role === 'viewer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:255',
            'full_description' => 'nullable|string',
            'priority_contact' => 'nullable|in:call,sms,messenger,email',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'social' => 'nullable|string',
            'birthday' => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'workplace' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'previous_workplaces' => 'nullable|string',
            'responsible_id' => 'nullable|exists:responsibles,id',
            'category_id' => 'nullable|exists:categories,id',
            'invitation_types' => 'nullable|array',
            'required_invitations' => 'nullable|array',
            'postal_address' => 'nullable|string',
            'region' => 'nullable|exists:cities,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'visible_only_to_admin' => 'nullable|boolean',
            'visible_only_to_editor' => 'nullable|boolean',
            'gifts_given' => 'nullable|string',
        ]);

        if ($request->has('invitation_types')) {
            $validated['invitation_types'] = implode(',', $request->invitation_types);
        }
        if ($request->has('required_invitations')) {
            $validated['required_invitations'] = implode(',', $request->required_invitations);
        }

        if ($user->role === 'admin') {
            $validated['visible_only_to_admin'] = $request->boolean('visible_only_to_admin', false);
            $validated['visible_only_to_editor'] = $request->boolean('visible_only_to_editor', false);
        } elseif ($user->role === 'editor') {
            $validated['visible_only_to_admin'] = false;
            $validated['visible_only_to_editor'] = $request->boolean('visible_only_to_editor', false);
        }

        $contact->update($validated);

        if ($request->has('tags')) {
            $contact->tags()->sync($request->tags);
        }

        $contact->load(['category', 'responsible', 'tags']);

        return response()->json($contact);
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }
}