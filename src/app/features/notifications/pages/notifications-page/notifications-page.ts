import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../../core/services/notification.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.scss']
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private location = inject(Location);
  private notificationSub: Subscription | undefined;

  notifications = signal<Notification[]>([]);
  activeTab = signal<'all' | 'messages' | 'ratings' | 'applications'>('all');

  filteredNotifications = computed(() => {
    const notifications = this.notifications();
    const tab = this.activeTab();
    if (tab === 'all') {
      return notifications;
    } else if (tab === 'messages') {
      return notifications.filter(n => n.type === 'message');
    } else if (tab === 'ratings') {
      return notifications.filter(n => n.type === 'rating');
    } else if (tab === 'applications') {
      return notifications.filter(n => n.type === 'application' || n.type === 'approved' || n.type === 'rejected');
    }
    return notifications;
  });

  ngOnInit() {
    this.notificationSub = this.notificationService.getNotificationsForCurrentUser().subscribe(notifications => {
      this.notifications.set(notifications);
    });
  }

  ngOnDestroy() {
    this.notificationSub?.unsubscribe();
  }

  get unreadCount() {
    return this.notifications().filter(n => !n.isRead).length;
  }

  get messageCount() {
    return this.notifications().filter(n => n.type === 'message').length;
  }

  get ratingCount() {
    return this.notifications().filter(n => n.type === 'rating').length;
  }

  get applicationCount() {
    return this.notifications().filter(n => n.type === 'application' || n.type === 'approved' || n.type === 'rejected').length;
  }

  setTab(tab: 'all' | 'messages' | 'ratings' | 'applications') {
    this.activeTab.set(tab);
  }

  async markAllAsRead() {
    await this.notificationService.markAllAsRead();
    this.notifications.update(notifications => 
      notifications.map(n => ({ ...n, isRead: true }))
    );
  }

  async markAsRead(notification: Notification) {
    if (notification.id && !notification.isRead) {
      await this.notificationService.markAsRead(notification.id);
      this.notifications.update(notifications =>
        notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }
  }

  async deleteNotification(id: string | undefined) {
    if (id) {
      await this.notificationService.deleteNotification(id);
      this.notifications.update(notifications => notifications.filter(n => n.id !== id));
    }
  }

  getBadgeClass(type: string) {
    switch (type) {
      case 'message': return 'bg-blue-500 text-white';
      case 'rating': return 'bg-yellow-400 text-yellow-800';
      case 'application': return 'bg-purple-500 text-white';
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  getBadgeText(type: string) {
    switch (type) {
      case 'message': return 'Mensaje';
      case 'rating': return 'Calificación';
      case 'application': return 'Postulación';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'General';
    }
  }

  goBack(): void {
    this.location.back();
  }

}
