import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../models/notification.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.scss']
})
export class NotificationsPageComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeTab: 'all' | 'messages' | 'ratings' | 'applications' = 'all';

  ngOnInit() {
    this.notifications = [
      {
        id: 1,
        type: 'message',
        sender: { name: 'Ana Rodríguez', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
        title: 'Nuevo mensaje de Ana Rodríguez',
        description: 'Quiere coordinar horarios para el proyecto.',
        read: false,
        time: '5m'
      },
      {
        id: 2,
        type: 'rating',
        sender: { name: 'Carlos Gomez', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
        title: 'Nueva calificación de Carlos Gomez',
        description: 'Ha calificado tu trabajo en el proyecto de diseño.',
        read: false,
        time: '2h'
      },
      {
        id: 3,
        type: 'application',
        sender: { name: 'Empresa Tech', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' },
        title: 'Nueva postulación de Empresa Tech',
        description: 'Están interesados en tu perfil para una vacante.',
        read: true,
        time: '1d'
      },
      {
        id: 4,
        type: 'approved',
        sender: { name: 'Global Solutions', avatar: 'https://randomuser.me/api/portraits/lego/2.jpg' },
        title: 'Postulación aprobada',
        description: '¡Felicidades! Tu postulación ha sido aprobada.',
        read: false,
        time: '3d'
      },
      {
        id: 5,
        type: 'rejected',
        sender: { name: 'Innovate Corp', avatar: 'https://randomuser.me/api/portraits/lego/3.jpg' },
        title: 'Postulación rechazada',
        description: 'Lamentamos informarte que tu postulación ha sido rechazada.',
        read: true,
        time: '5d'
      }
    ];
    this.filterNotifications();
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
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

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.filterNotifications();
  }

  markAsRead(notification: Notification) {
    notification.read = true;
    this.filterNotifications();
  }

  deleteNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.filterNotifications();
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