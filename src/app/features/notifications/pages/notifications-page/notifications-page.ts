import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../../core/services/notification.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.scss']
})
export class NotificationsPageComponent implements OnInit {
  private notificationService = inject(NotificationService);
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeTab: 'all' | 'messages' | 'ratings' | 'applications' = 'all';

  async ngOnInit() {
    this.notifications = await this.notificationService.getNotificationsForCurrentUser();
    this.filterNotifications();
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get messageCount() {
    return this.notifications.filter(n => n.type === 'message').length;
  }

  get ratingCount() {
    return this.notifications.filter(n => n.type === 'rating').length;
  }

  get applicationCount() {
    return this.notifications.filter(n => n.type === 'application' || n.type === 'approved' || n.type === 'rejected').length;
  }

  setTab(tab: 'all' | 'messages' | 'ratings' | 'applications') {
    this.activeTab = tab;
    this.filterNotifications();
  }

  filterNotifications() {
    if (this.activeTab === 'all') {
      this.filteredNotifications = this.notifications;
    } else if (this.activeTab === 'messages') {
      this.filteredNotifications = this.notifications.filter(n => n.type === 'message');
    } else if (this.activeTab === 'ratings') {
      this.filteredNotifications = this.notifications.filter(n => n.type === 'rating');
    } else if (this.activeTab === 'applications') {
      this.filteredNotifications = this.notifications.filter(n => n.type === 'application' || n.type === 'approved' || n.type === 'rejected');
    }
  }

  async markAllAsRead() {
    await this.notificationService.markAllAsRead();
    this.notifications.forEach(n => n.isRead = true);
    this.filterNotifications();
  }

  async markAsRead(notification: Notification) {
    if (notification.id) {
      await this.notificationService.markAsRead(notification.id);
      notification.isRead = true;
      this.filterNotifications();
    }
  }

  async deleteNotification(id: string | undefined) {
    if (id) {
      await this.notificationService.deleteNotification(id);
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.filterNotifications();
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

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

}
