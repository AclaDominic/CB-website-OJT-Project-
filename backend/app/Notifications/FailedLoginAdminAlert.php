<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FailedLoginAdminAlert extends Notification
{
    use Queueable;

    protected $email;
    protected $ipAddress;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $email, string $ipAddress)
    {
        $this->email = $email;
        $this->ipAddress = $ipAddress;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'security_alert',
            'message' => "Warning: Multiple failed login attempts detected for email: {$this->email} from IP: {$this->ipAddress}.",
            'preview' => "Security Warning: Failed logins for {$this->email}",
            'email' => $this->email,
            'ip_address' => $this->ipAddress,
        ];
    }
}
