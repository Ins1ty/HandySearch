<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Responsible;
use Illuminate\Http\Request;

class ResponsibleController extends Controller
{
    public function index()
    {
        $responsibles = Responsible::orderBy('name')->get();
        return response()->json($responsibles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $responsible = Responsible::create($validated);

        return response()->json($responsible, 201);
    }

    public function update(Request $request, Responsible $responsible)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $responsible->update($validated);

        return response()->json($responsible);
    }

    public function destroy(Responsible $responsible)
    {
        $responsible->delete();

        return response()->json(['message' => 'Responsible deleted successfully']);
    }
}
