
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Category } from '../../models/dashboard';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
  
  allWorkers: User[] = [];
  filteredWorkers$!: Observable<User[]>;

  activeWorkersCount = 0;
  isSidebarOpen = false;
  
  categories$!: Observable<Category[]>;
  categoryFilter = new FormControl('todos');

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;
    this.loadActiveWorkersCount();

    const workers$ = this.userService.getWorkers();

    this.categories$ = workers$.pipe(
      map(workers => {
        const allOficios = workers.flatMap(worker => worker.oficios || []);
        const uniqueOficios = [...new Set(allOficios)];
        const categoryCounts = uniqueOficios.reduce((acc, oficio) => {
          acc[oficio] = allOficios.filter(o => o === oficio).length;
          return acc;
        }, {} as { [key: string]: number });

        const categories: Category[] = uniqueOficios.map(oficio => ({
          id: oficio, // ID is the oficio name itself
          name: `🔎 ${oficio}`,
          count: categoryCounts[oficio]
        }));

        const totalCount = workers.length;
        categories.unshift({ id: 'todos', name: 'Todos', count: totalCount });

        return categories;
      })
    );

    this.filteredWorkers$ = combineLatest([
      workers$,
      this.categoryFilter.valueChanges.pipe(startWith('todos'))
    ]).pipe(
      map(([workers, selectedCategory]) => {
        this.allWorkers = workers;
        if (selectedCategory === 'todos' || !selectedCategory) {
          return workers;
        }
        return workers.filter(worker => worker.oficios?.includes(selectedCategory));
      })
    );
  }

  async loadActiveWorkersCount() {
    this.activeWorkersCount = await this.userService.getActiveWorkersCount();
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  setActiveCategory(categoryId: string | null) {
    this.categoryFilter.setValue(categoryId);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  async contactWorker(worker: User) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
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
