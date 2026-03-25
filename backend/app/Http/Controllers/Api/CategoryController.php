<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'nullable|string|max:20',
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
