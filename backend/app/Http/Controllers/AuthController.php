<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $throttleKey = mb_strtolower($request->input('email')) . '|' . $request->ip();
        $multiplierKey = 'login_lockout_multiplier:' . $throttleKey;

        // 1. Check if the user is already locked out
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = ceil($seconds / 60);

            return response()->json([
                'message' => "Too many login attempts. Please try again in {$minutes} minutes."
            ], 429);
        }

        // 2. Attempt login
        if (Auth::attempt($credentials)) {
            // clear the limiter on success
            RateLimiter::clear($throttleKey);
            Cache::forget($multiplierKey);

            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'role' => $user->role
            ]);
        }

        // 3. Login failed: Hit the rate limiter
        // Calculate dynamic lockout time. Base is 10 mins.
        $multiplier = Cache::get($multiplierKey, 1);
        $decaySeconds = 600 * $multiplier; // 10 minutes * multiplier

        RateLimiter::hit($throttleKey, $decaySeconds);

        // 4. Check if they *just* hit the limit
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            // They just reached the 5th attempt and are now locked out.
            // Increase the multiplier for the *next* time they get locked out
            Cache::put($multiplierKey, $multiplier + 1, now()->addHours(24));

            // Dispatch User Notification (if user exists)
            $targetUser = User::where('email', $request->input('email'))->first();
            if ($targetUser) {
                $targetUser->notify(new \App\Notifications\FailedLoginUserAlert());
            }

            // Dispatch Admin Notifications
            // Since User model has a `role` column or 'admin' check, we'll fetch them. 
            // The prompt implied system.manage_users permission, but we'll try Spatie's method as well. 
            // In case of error we'll use a safer fallback.
            try {
                $admins = User::permission('system.manage_users')->get();
            } catch (\Exception $e) {
                // Fallback if permission is undefined or Spatie throws an error
                $admins = User::where('role', 'admin')->get();
            }

            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\FailedLoginAdminAlert(
                    $request->input('email'),
                    $request->ip()
                ));
            }

            $minutes = ceil($decaySeconds / 60);
            return response()->json([
                'message' => "Too many login attempts. Please try again in {$minutes} minutes."
            ], 429);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
