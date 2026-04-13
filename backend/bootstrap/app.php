<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (Throwable $e) {
            // Only log if the user is authenticated (meaning it's an internal/private page error)
            // and it's not a validation, authentication, or authorization exception
            if (auth()->check()
                && !$e instanceof \Illuminate\Validation\ValidationException
                && !$e instanceof \Illuminate\Auth\AuthenticationException
                && !$e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                \App\Models\SystemAlert::create([
                    'type' => 'critical',
                    'message' => $e->getMessage() ?: 'Unhandled Internal Error',
                    'context' => [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'url' => request()->url(),
                        'method' => request()->method(),
                        'user_id' => auth()->id(),
                    ]
                ]);
            }
        });
    })->create();
