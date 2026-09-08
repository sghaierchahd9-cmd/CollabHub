
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationSocketService } from '../notification-socket-service';
import { NotificationHttpService } from '../notification-http-service';
import { Notification } from '../Model/Notification';
import { ToastNotificationItemComponent } from '../toast-notification-item-component/toast-notification-item-component';

@Component({
  selector: 'app-notification-list-component',
  imports: [ToastNotificationItemComponent],
  templateUrl: './notification-list-component.html',
  styleUrl: './notification-list-component.css',
})
export class NotificationListComponent implements OnDestroy , OnInit {
   toasts: Notification[] = [];
  private sub?: Subscription;

  constructor(
    private notificationSocketService: NotificationSocketService,
    private notificationHttpService: NotificationHttpService
  ) {}

  ngOnInit(): void {
    this.sub = this.notificationSocketService.notificationRecue.subscribe(notif => {
      this.toasts = [...this.toasts, notif]; // spread requis (cf. OnChanges/référence)
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onDismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
    onClicked(id: number): void {
    this.notificationHttpService.marquerCommeLue(id).subscribe({
      error: err => console.error('Erreur mark-as-read', err),
    });
    this.onDismiss(id); 
  }

}
