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
        } elseif ($user->role === 'editor') {
            $query->where(function ($q) use ($user) {
                $q->where('visible_only_to_editor', false)
                  ->orWhere('responsible_id', $user->id);
            });
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

        if ($request->has('is_priest')) {
            $query->where('is_priest', $request->boolean('is_priest'));
        }

        if ($request->has('region')) {
            $query->where('region', 'like', "%{$request->region}%");
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('father_name', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if (in_array($sortBy, ['name', 'region', 'birthday', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('name');
        }

        $contacts = $query->get();

        return response()->json($contacts);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_priest' => 'nullable|boolean',
            'father_name' => 'nullable|string|max:255',
            'priority_contact' => 'nullable|in:call,sms,messenger,email',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'social' => 'nullable|string',
            'birthday' => 'nullable|date',
            'responsible_id' => 'nullable|exists:responsibles,id',
            'category_id' => 'nullable|exists:categories,id',
            'invitation_types' => 'nullable|array',
            'required_invitations' => 'nullable|array',
            'postal_address' => 'nullable|string',
            'region' => 'nullable|exists:cities,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $validated['invitation_types'] = $request->has('invitation_types') ? implode(',', $request->invitation_types) : null;
        $validated['required_invitations'] = $request->has('required_invitations') ? implode(',', $request->required_invitations) : null;

        if ($user->role === 'admin') {
            $validated['visible_only_to_admin'] = $request->boolean('visible_only_to_admin', false);
            $validated['visible_only_to_editor'] = $request->boolean('visible_only_to_editor', false);
        } elseif ($user->role === 'editor') {
            $validated['visible_only_to_admin'] = false;
            if ($request->boolean('visible_only_to_editor', false)) {
                $validated['visible_only_to_editor'] = true;
                $validated['responsible_id'] = $user->id;
            } else {
                $validated['visible_only_to_editor'] = false;
            }
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
        
        if ($contact->visible_only_to_editor) {
            if ($user->role === 'viewer') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            if ($user->role === 'editor' && $contact->responsible_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
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
        
        if ($contact->visible_only_to_editor) {
            if ($user->role === 'viewer') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            if ($user->role === 'editor' && $contact->responsible_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_priest' => 'nullable|boolean',
            'father_name' => 'nullable|string|max:255',
            'priority_contact' => 'nullable|in:call,sms,messenger,email',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'social' => 'nullable|string',
            'birthday' => 'nullable|date',
            'responsible_id' => 'nullable|exists:responsibles,id',
            'category_id' => 'nullable|exists:categories,id',
            'invitation_types' => 'nullable|array',
            'required_invitations' => 'nullable|array',
            'postal_address' => 'nullable|string',
            'region' => 'nullable|exists:cities,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
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
            if ($request->boolean('visible_only_to_editor', false)) {
                $validated['visible_only_to_editor'] = true;
                $validated['responsible_id'] = $user->id;
            } else {
                $validated['visible_only_to_editor'] = false;
            }
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
