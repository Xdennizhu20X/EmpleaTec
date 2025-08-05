import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Chat, User } from '../../models/chat';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-messages-screen',
  templateUrl: './messages-screen.html',
  styleUrls: ['./messages-screen.scss']
})
export class MessagesScreen implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = '';
  user: User | null = null;
  recentChats: Chat[] = [];
  filteredChats: Chat[] = [];
  totalUnreadMessages = 0;

  ngOnInit(): void {
    this.user = {
      id: 'current_user_id',
      name: 'Current User',
      avatar: 'path/to/user/avatar.jpg'
    };

    this.loadRecentChats();
    this.filteredChats = this.recentChats;
    this.calculateTotalUnread();
  }

  loadRecentChats(): void {
    this.recentChats = [
      {
        id: '1',
        participant: {
          id: '1',
          name: 'Carlos Mendoza',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          userType: 'worker',
          specialty: 'Carpintería',
          isOnline: true
        },
        lastMessage: {
          text: '¡Perfecto! Puedo empezar el proyecto la próxima semana. Te envío el presupuesto detallado.',
          timestamp: new Date(Date.now() - 300000),
          senderId: '1',
          isRead: true
        },
        unreadCount: 0,
        projectTitle: 'Renovación de cocina integral'
      },
      {
        id: '2',
        participant: {
          id: '2',
          name: 'Ana Rodríguez',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=150&h=150&fit=crop&crop=face',
          userType: 'client',
          isOnline: false
        },
        lastMessage: {
          text: 'Hola! Me interesa tu propuesta para el proyecto de plomería. ¿Podrías darme más detalles?',
          timestamp: new Date(Date.now() - 3600000),
          senderId: '2',
          isRead: false
        },
        unreadCount: 2,
        projectTitle: 'Reparación de fuga en baño'
      },
      {
        id: '3',
        participant: {
          id: '3',
          name: 'María López',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          userType: 'worker',
          specialty: 'Pintura',
          isOnline: true
        },
        lastMessage: {
          text: 'Muchas gracias por elegirme para el proyecto. El trabajo quedó excelente ',
          timestamp: new Date(Date.now() - 86400000),
          senderId: '3',
          isRead: true
        },
        unreadCount: 0,
        projectTitle: 'Pintura interior de departamento'
      },
    ];
  }

  filterChats(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredChats = this.recentChats.filter(chat =>
      chat.participant.name.toLowerCase().includes(query) ||
      chat.projectTitle.toLowerCase().includes(query)
    );
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString('es-MX');
  }

  calculateTotalUnread(): void {
    this.totalUnreadMessages = this.recentChats.reduce((total, chat) => total + chat.unreadCount, 0);
  }

  handleChatClick(chat: Chat): void {
    this.router.navigate(['/chat', chat.id]);
  }

  onBack(): void {
    this.router.navigate(['/dashboard-client']);
  }

  onLogout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }

  get onlineCount(): number {
    return this.recentChats.filter(chat => chat.participant.isOnline).length;
  }
}
