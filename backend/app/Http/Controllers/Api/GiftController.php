<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gift;
use Illuminate\Http\Request;

class GiftController extends Controller
{
    public function index(Request $request)
    {
        $query = Gift::query();

        if ($request->has('contact_id')) {
            $query->whereHas('contacts', function ($q) use ($request) {
                $q->where('contacts.id', $request->contact_id);
            });
        }

        $gifts = $query->orderBy('given_at', 'desc')->get();

        return response()->json($gifts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'given_at' => 'nullable|date',
        ]);

        $gift = Gift::create($validated);

        return response()->json($gift, 201);
    }

    public function show(Gift $gift)
    {
        $gift->load(['contacts', 'events']);

        return response()->json($gift);
    }

    public function update(Request $request, Gift $gift)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'given_at' => 'nullable|date',
        ]);

        $gift->update($validated);

        return response()->json($gift);
    }

    public function destroy(Gift $gift)
    {
        $gift->delete();

        return response()->json(['message' => 'Gift deleted successfully']);
    }
}
