import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

  searchQuery = signal('');
  currentUser: User | null = null;
  
  private allChats = signal<Chat[]>([]);
  
  readonly filteredChats = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.allChats();
    }
    return this.allChats().filter(chat =>
      this.getParticipant(chat)?.name.toLowerCase().includes(query) ||
      chat.projectTitle.toLowerCase().includes(query)
    );
  });

  readonly totalUnreadMessages = computed(() => {
    return this.allChats().reduce((total, chat) => total + chat.unreadCount, 0);
  });

  readonly onlineCount = computed(() => {
    return this.allChats().filter(chat => this.getParticipant(chat)?.isOnline).length;
  });

  ngOnInit(): void {
    // Simulación de obtener el usuario actual
    this.currentUser = {
      id: 'current_user_id',
      name: 'Current User',
      avatar: 'path/to/user/avatar.jpg',
      userType: 'client',
      isOnline: true
    };

    this.loadRecentChats();
  }

  loadRecentChats(): void {
    const mockChats: Chat[] = [
      {
        id: '1',
        participants: [
          this.currentUser!,
          { id: '1', name: 'Carlos Mendoza', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', userType: 'worker', specialty: 'Carpintería', isOnline: true }
        ],
        lastMessage: { text: '¡Perfecto! Puedo empezar el proyecto la próxima semana. Te envío el presupuesto detallado.', timestamp: new Date(Date.now() - 300000), senderId: '1' },
        unreadCount: 0,
        projectTitle: 'Renovación de cocina integral',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        participants: [
          this.currentUser!,
          { id: '2', name: 'Ana Rodríguez', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=150&h=150&fit=crop&crop=face', userType: 'client', isOnline: false }
        ],
        lastMessage: { text: 'Hola! Me interesa tu propuesta para el proyecto de plomería. ¿Podrías darme más detalles?', timestamp: new Date(Date.now() - 3600000), senderId: '2' },
        unreadCount: 2,
        projectTitle: 'Reparación de fuga en baño',
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 3600000)
      },
    ];
    this.allChats.set(mockChats);
  }

  getParticipant(chat: Chat): User | undefined {
    return chat.participants.find(p => p.id !== this.currentUser?.id);
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

  handleChatClick(chat: Chat): void {
    this.router.navigate(['/chat', chat.id]);
  }

  onBack(): void {
    this.router.navigate(['/dashboard-client']);
  }

  onLogout(): void {
    // this.authService.signOut();
    // this.router.navigate(['/login']);
    console.log('Logout');
  }
}
