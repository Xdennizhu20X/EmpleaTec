import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { User } from '../../../../core/models/user.model';
import { Firestore, collection, query, where, getDocs, addDoc, serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-worker-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './worker-profile.html',
  styleUrls: ['./worker-profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerProfileComponent implements OnInit {
  activeTab = signal('portafolio');
  isFavorited = signal(false);
  isModalOpen = signal(false);
  selectedImage = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  private router = inject(Router);

  private authService = inject(AuthService);
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  worker = signal<User | null>(null);

  ngOnInit(): void {
    const workerId = this.route.snapshot.paramMap.get('id');
    if (workerId) {
      this.userService.getUserById(workerId).subscribe(user => {
        this.worker.set(user);
      });
    }
  }

  onBack(): void {
    window.history.back();
  }

  toggleFavorite() {
    this.isFavorited.update(fav => !fav);
  }

  selectTab(tab: string) {
    this.activeTab.set(tab);
  }

  openModal(imageUrl: string) {
    this.selectedImage.set(imageUrl);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedImage.set(null);
  }

  getOficioIcon(oficio: string): string {
    const iconMap: { [key: string]: string } = {
      'carpintería': 'M10 20l4-16m-4 4h14',
      'plomería': 'M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 16c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z',
      'electricidad': 'M13 10V3L4 14h7v7l9-11h-7z',
      'albañilería': 'M12 2L1 9l4 12h14l4-12L12 2z',
      'jardinería': 'M17.66 17.66C16.43 18.89 14.78 19.5 13 19.5c-1.78 0-3.43-.61-4.66-1.84A6.5 6.5 0 0113 6.5c1.78 0 3.43.61 4.66 1.84l-1.42 1.42A4.5 4.5 0 0013 8.5a4.5 4.5 0 00-3.24 7.74l-1.42 1.42zM12 12a2 2 0 11-4 0 2 2 0 014 0z',
      'pintura': 'M12 14l9-9-9-9-9 9 9 9zm0 0v-4',
      'limpieza': 'M12 14l9-9-9-9-9 9 9 9zm0 0v-4',
      'default': 'M5 13l4 4L19 7'
    };
    return iconMap[oficio.toLowerCase()] || iconMap['default'];
  }

  formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : date;
    return formatDate(jsDate, 'dd/MM/yyyy', 'en-US');
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

