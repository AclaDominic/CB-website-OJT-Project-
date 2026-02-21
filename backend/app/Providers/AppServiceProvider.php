<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Notifications\DatabaseNotification::saved(function ($model) {
            event(new \App\Events\NotificationSent());
            event(new \App\Events\DashboardUpdated());
        });

        \Illuminate\Notifications\DatabaseNotification::deleted(function ($model) {
            event(new \App\Events\NotificationSent());
            event(new \App\Events\DashboardUpdated());
        });

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url') . "/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
