import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationHttpService } from '../notification-http-service';
import { NotificationSocketService } from '../notification-socket-service';
import { Notification } from '../Model/Notification';
import { libelleTypeNotification, estUrgente } from '../Model/NotificationTypeMap';
@Component({
  selector: 'app-notification-bell-component',
  imports: [CommonModule],
  templateUrl: './notification-bell-component.html',
  styleUrl: './notification-bell-component.css',
})
export class NotificationBellComponent {
   isOpen = false;
  notifications: Notification[] = [];
  private sub?: Subscription;
  libelle = libelleTypeNotification;
  urgente = estUrgente;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.estLue).length;
  }

  constructor(
    private notificationHttpService: NotificationHttpService,
    private notificationSocketService: NotificationSocketService
  ) {}

  ngOnInit(): void {
    this.notificationHttpService.getNotifications().subscribe(list => {
      this.notifications = list;
    });

    this.sub = this.notificationSocketService.notificationRecue.subscribe(notif => {
      this.notifications = [notif, ...this.notifications];
    });
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation(); 
    this.isOpen = !this.isOpen;
  }

  onNotificationClick(notif: Notification): void {
    if (notif.estLue) return;
    this.notificationHttpService.marquerCommeLue(notif.id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          n.id === notif.id ? { ...n, estLue: true } : n
        );
      },
      error: err => console.error('Erreur mark-as-read', err),
    });
  }
   ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-notification-bell')) {
      this.isOpen = false;
    }
  }
}
