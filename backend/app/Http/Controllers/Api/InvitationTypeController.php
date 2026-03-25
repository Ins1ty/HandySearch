<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvitationType;
use Illuminate\Http\Request;

class InvitationTypeController extends Controller
{
    public function index()
    {
        $types = InvitationType::orderBy('name')->get();
        return response()->json($types);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
        ]);

        $type = InvitationType::create($validated);

        return response()->json($type, 201);
    }

    public function show(InvitationType $invitationType)
    {
        return response()->json($invitationType);
    }

    public function update(Request $request, InvitationType $invitationType)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'nullable|string|max:20',
        ]);

        $invitationType->update($validated);

        return response()->json($invitationType);
    }

    public function destroy(InvitationType $invitationType)
    {
        $invitationType->delete();

        return response()->json(['message' => 'Invitation type deleted successfully']);
    }
}
