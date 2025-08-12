
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Category, WorkerCard } from '../../models/dashboard';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, addDoc, serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-client.html',
  styleUrls: ['./dashboard-client.scss']
})
export class DashboardClient implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  user$!: Observable<User | null>;
  featuredWorkers$!: Observable<User[]>;

  isSidebarOpen = false;
  categories: Category[] = [
    { id: 'todos', name: 'Todos', count: 156 },
    { id: 'carpinteria', name: '🔨 Carpintería', count: 42 },
    { id: 'plomeria', name: '🔧 Plomería', count: 38 },
    { id: 'electricidad', name: '⚡ Electricidad', count: 29 },
    { id: 'albanileria', name: '🧱 Albañilería', count: 21 },
    { id: 'jardineria', name: '🌳 Jardinería', count: 15 },
    { id: 'pintura', name: '🎨 Pintura', count: 14 },
    { id: 'limpieza', name: '🧹 Limpieza', count: 11 },
  ];

  activeCategory: string = 'todos';

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
    this.featuredWorkers$ = this.userService.getWorkers();
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  async contactWorker(worker: User) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      // Handle case where user is not logged in
      this.router.navigate(['/auth/client-login']);
      return;
    }

    const chatsCollection = collection(this.firestore, 'chats');
    const participants = [currentUser.uid, worker.uid].sort();
    const q = query(chatsCollection, where('participants', '==', participants));

    const existingChatSnapshot = await getDocs(q);

    if (!existingChatSnapshot.empty) {
      const chatId = existingChatSnapshot.docs[0].id;
      this.router.navigate(['/chat', chatId]);
    } else {
      const newChat = {
        participants,
        participantInfo: [
          { id: currentUser.uid, name: currentUser.displayName || 'Tú', avatar: currentUser.photoURL || '' },
          { id: worker.uid, name: worker.displayName, avatar: worker.photoURL || '' }
        ],
        projectTitle: `Conversación con ${worker.displayName}`,
        lastMessage: { text: 'Inicia la conversación!', timestamp: serverTimestamp() },
        unreadCount: 0,
        isFinalized: false,
      };
      const docRef = await addDoc(chatsCollection, newChat);
      this.router.navigate(['/chat', docRef.id]);
    }
  }
}
