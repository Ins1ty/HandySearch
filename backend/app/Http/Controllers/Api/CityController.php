<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index()
    {
        $cities = City::orderBy('name')->get();
        return response()->json($cities);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $city = City::create($validated);
        return response()->json($city, 201);
    }

    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        $city->update($validated);
        return response()->json($city);
    }

    public function destroy(City $city)
    {
        $city->delete();
        return response()->json(['message' => 'City deleted successfully']);
    }
}