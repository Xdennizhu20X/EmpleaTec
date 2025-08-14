
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

  backgroundImages: string[] = [
    'https://i.pinimg.com/736x/28/4a/a8/284aa87260ad17790d2ccf14305063e1.jpg',
    'https://images.ctfassets.net/hrltx12pl8hq/2RwJp3f9UiCnfWBEunwxOQ/f11257994853124d7b1a6a935e678c13/0_hero.webp?fit=fill&w=600&h=400',
    'https://img.freepik.com/free-vector/dark-hexagonal-background-with-gradient-color_79603-1409.jpg?semt=ais_hybrid&w=740&q=80',
    'https://psdboom.com/wp-content/uploads/2014/07/dfgh.jpg',
    'https://www.svgbackgrounds.com/wp-content/uploads/2021/06/ribbon-weave-shiny-repeating-pattern.jpg',
    'https://www.svgbackgrounds.com/wp-content/uploads/2021/05/dual-ripples-vector-background.jpg',
    'https://wallpapers.com/images/hd/high-resolution-blue-background-1920-x-1080-9ievy5j853ofx6e1.jpg',
    'https://media.istockphoto.com/id/2193410425/photo/grunge-paper-texture-or-background.jpg?b=1&s=612x612&w=0&k=20&c=tCbuRGodJxHQSLgHkA31l3uDKgzcYaH9N0u1B3A3Nwg=',
    'https://t4.ftcdn.net/jpg/05/18/41/91/360_F_518419158_yXXBww2r5Z3XoutBxRX8KHNZOpPjhC03.jpg',
    'https://thumbs.dreamstime.com/b/vintage-colorful-nature-background-grunge-retro-texture-hd-paper-42811045.jpg',
    'https://img.freepik.com/free-vector/abstract-dark-blue-polygonal-background_1035-9700.jpg'
  ];

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
          id: oficio,
          name: `${this.getIconForOficio(oficio)} ${oficio}`,
          count: categoryCounts[oficio]
        }));

        const totalCount = workers.length;
        categories.unshift({ id: 'todos', name: '🔍 Todos', count: totalCount });

        return categories;
      })
    );

    this.filteredWorkers$ = combineLatest([
      workers$,
      this.categoryFilter.valueChanges.pipe(startWith('todos'))
    ]).pipe(
      map(([workers, selectedCategory]) => {
        this.allWorkers = workers;
        let filtered = workers;
        if (selectedCategory !== 'todos' && selectedCategory) {
          filtered = workers.filter(worker => worker.oficios?.includes(selectedCategory));
        }
        // Assign a cover image to each worker
        return filtered.map((worker, index) => ({
          ...worker,
          coverURL: this.backgroundImages[index % this.backgroundImages.length]
        }));
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

  getIconForOficio(oficio: string): string {
    const iconMap: { [key: string]: string } = {
      'plomería': '🪠',
      'cerrajería': '🔑',
      'soldadura': '🧲',
      'electricidad': '⚡',
      'carpintería': '🪚',
      'albanileria': '🧱',
      'pintor': '🎨',
      'jardinería': '🌳',
      'limpieza': '🧹',
      'reparación de electrodomésticos': '🔧',
    };
    return iconMap[oficio.toLowerCase()] || '🧱';
  }
}
