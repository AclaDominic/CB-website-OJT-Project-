<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (!Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            $throttleKey = $this->throttleKey();

            // 1. Inhumane Speed Checking (5 attempts in 10 seconds)
            $inhumaneKey = $throttleKey . '_inhumane';
            RateLimiter::hit($inhumaneKey, 10);

            if (RateLimiter::tooManyAttempts($inhumaneKey, 5)) {
                // Apply 24h ban cache (Store exact unban timestamp to calculate seconds)
                \Illuminate\Support\Facades\Cache::put('login_banned:' . $throttleKey, now()->addHours(24)->timestamp, now()->addHours(24));
            }

            // 2. Standard Rate Limiting with Dynamic Decay
            $multiplierKey = 'login_lockout_multiplier:' . $throttleKey;
            $multiplier = \Illuminate\Support\Facades\Cache::get($multiplierKey, 1);
            $decaySeconds = 600 * $multiplier;

            RateLimiter::hit($throttleKey, $decaySeconds);

            // If this attempt just hit the limit, dispatch the alerts
            if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
                // Increase the multiplier for the next lockout
                \Illuminate\Support\Facades\Cache::put($multiplierKey, $multiplier + 1, now()->addHours(24));

                $email = $this->input('email');

                // Notify User Action
                $targetUser = \App\Models\User::where('email', $email)->first();
                if ($targetUser) {
                    $targetUser->notify(new \App\Notifications\FailedLoginUserAlert());
                }

                // Notify Admins
                try {
                    $admins = \App\Models\User::permission('system.manage_users')->get();
                } catch (\Exception $e) {
                    $admins = \App\Models\User::where('role', 'admin')->get();
                }

                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\FailedLoginAdminAlert($email, $this->ip()));
                }
            }

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // On success, clear the limiters and multipliers
        RateLimiter::clear($this->throttleKey());
        RateLimiter::clear($this->throttleKey() . '_inhumane');
        \Illuminate\Support\Facades\Cache::forget('login_banned:' . $this->throttleKey());
        \Illuminate\Support\Facades\Cache::forget('login_lockout_multiplier:' . $this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        $throttleKey = $this->throttleKey();
        $banKey = 'login_banned:' . $throttleKey;

        // 1. Check aggressive 24h ban
        if (\Illuminate\Support\Facades\Cache::has($banKey)) {
            event(new Lockout($this));
            $unbanAt = \Illuminate\Support\Facades\Cache::get($banKey);
            $seconds = max(1, $unbanAt - time()); // Prevent 0 seconds

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // 2. Check standard dynamic rate limit
        if (!RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($throttleKey);

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('email')) . '|' . $this->ip());
    }
}
