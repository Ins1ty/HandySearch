<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GiftController;
use App\Http\Controllers\Api\InvitationTypeController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ResponsibleController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('tags', TagController::class);
    Route::apiResource('invitation-types', InvitationTypeController::class);
    Route::apiResource('gifts', GiftController::class);
    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('events', EventController::class);
    Route::get('/events/{event}/invitable-contacts', [EventController::class, 'getInvitableContacts']);
    Route::apiResource('users', UserController::class)->except(['show']);
    Route::apiResource('responsibles', ResponsibleController::class)->except(['show']);
});
