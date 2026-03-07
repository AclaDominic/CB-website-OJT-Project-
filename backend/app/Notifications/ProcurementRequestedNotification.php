<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProcurementRequestedNotification extends Notification
{
    use Queueable;

    protected $procurement;

    public function __construct($procurement)
    {
        $this->procurement = $procurement;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'procurement_submitted',
            'message' => 'New procurement request submitted by ' . ($this->procurement->user ? $this->procurement->user->name : 'Unknown') . '.',
            'project_name' => $this->procurement->project ? $this->procurement->project->name : 'N/A',
            'requester_name' => $this->procurement->user ? $this->procurement->user->name : 'Unknown',
            'procurement_request_id' => $this->procurement->id
        ];
    }
}
