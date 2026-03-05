<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Inquiry;

class InquiryReceivedNotification extends Notification
{
    use Queueable;

    protected $inquiry;

    /**
     * Create a new notification instance.
     */
    public function __construct(Inquiry $inquiry)
    {
        $this->inquiry = $inquiry;
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
            'type' => 'inquiry_received',
            'message' => 'New inquiry received from ' . $this->inquiry->name,
            'inquiry_id' => $this->inquiry->id,
            'sender_name' => $this->inquiry->name,
            'sender_email' => $this->inquiry->email,
            'subject' => $this->inquiry->subject,
        ];
    }
}
