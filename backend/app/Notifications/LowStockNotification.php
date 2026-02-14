<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    protected $items;

    /**
     * Create a new notification instance.
     */
    public function __construct($items)
    {
        $this->items = $items;
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
            'type' => 'low_stock',
            'message' => "Warning: {$this->items->count()} items are low on stock.",
            'items_count' => $this->items->count(),
            'preview' => $this->items->take(3)->pluck('name')->implode(', ') . ($this->items->count() > 3 ? '...' : '')
        ];
    }
}
