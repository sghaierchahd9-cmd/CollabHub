import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Notification } from '../Model/Notification';
import { libelleTypeNotification, estUrgente } from '../Model/NotificationTypeMap';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-toast-notification-item-component',
  imports: [CommonModule],
  templateUrl: './toast-notification-item-component.html',
  styleUrl: './toast-notification-item-component.css',
})
export class ToastNotificationItemComponent {
    @Input({ required: true }) notification!: Notification;
  @Output() dismiss = new EventEmitter<number>();
  @Output() clicked = new EventEmitter<number>();

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timer = setTimeout(() => this.dismiss.emit(this.notification.id), 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  onClick(): void {
    this.clicked.emit(this.notification.id);
  }

  onCloseClick(event: MouseEvent): void {
    event.stopPropagation(); // évite de déclencher onClick() en plus
    this.dismiss.emit(this.notification.id);
  }
  get libelle(): string {
    return libelleTypeNotification(this.notification.typeEvenement);
  }

  get urgente(): boolean {
    return estUrgente(this.notification.typeEvenement);
  }
}
