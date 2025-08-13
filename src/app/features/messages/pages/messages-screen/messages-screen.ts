import { Component, computed, inject, OnDestroy, OnInit, signal, effect } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, collection, query, where, onSnapshot, orderBy, CollectionReference, DocumentData, getDocs, addDoc, serverTimestamp, limit } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

// --- Interfaces ---
interface AppUser {
  uid: string;
  displayName: string;
  photoURL?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface Message {
  text: string;
  timestamp: any;
}

interface Chat {
  id: string;
  participants: string[];
  participantInfo: Participant[];
  projectTitle: string;
  lastMessage: Message;
  unreadCount: number;
}

@Component({
  selector: 'app-messages-screen',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messages-screen.html',
  styleUrls: ['./messages-screen.scss']
})
export class MessagesScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private location = inject(Location);
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  private userSubscription: Subscription | undefined;
  private firestoreSubscription: (() => void) | undefined;

  currentUser = signal<User | null>(null);
  chats = signal<Chat[]>([]);
  searchQuery = signal('');
  searchResults = signal<AppUser[]>([]);
  isSearching = signal(false);

  constructor() {
    effect(async () => {
      const queryText = this.searchQuery();
      this.isSearching.set(queryText.length > 0);
      if (queryText.length > 2) {
        await this.searchUsers(queryText);
      } else {
        this.searchResults.set([]);
      }
    });
  }

  // --- SEÑALES COMPUTADAS ---
  filteredChats = computed(() => {
    // Esta función ahora solo devuelve los chats, ya que la búsqueda es para usuarios.
    return this.chats();
  });

  totalUnreadMessages = computed(() =>
    this.chats().reduce((sum, chat) => sum + chat.unreadCount, 0)
  );

  ngOnInit(): void {
    this.userSubscription = user(this.auth).subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.listenToChats(user.uid);
      } else {
        this.chats.set([]);
        this.firestoreSubscription?.();
      }
    });
  }

  async searchUsers(queryText: string) {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(
      usersCollection,
      where('displayName', '>=', queryText),
      where('displayName', '<=', queryText + '\uf8ff'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs
      .map(doc => doc.data() as AppUser)
      .filter(user => user.uid !== this.currentUser()?.uid); // Excluir al usuario actual
    this.searchResults.set(users);
  }

  async handleUserClick(selectedUser: AppUser) {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    const chatsCollection = collection(this.firestore, 'chats');
    // Ordenar los UIDs para asegurar consistencia en la consulta
    const participants = [currentUser.uid, selectedUser.uid].sort();
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
          { id: selectedUser.uid, name: selectedUser.displayName, avatar: selectedUser.photoURL || '' }
        ],
        projectTitle: 'Nueva Conversación',
        lastMessage: { text: 'Inicia la conversación!', timestamp: serverTimestamp() },
        unreadCount: 0
      };
      const docRef = await addDoc(chatsCollection, newChat);
      this.router.navigate(['/chat', docRef.id]);
    }
    this.searchQuery.set('');
  }

  // Función para manejar el click en un chat existente
  handleChatClick(chat: Chat): void {
    this.router.navigate(['/chat', chat.id]);
  }

  listenToChats(userId: string): void {
    const chatsCollection = collection(this.firestore, 'chats') as CollectionReference<DocumentData>;
    const q = query(
      chatsCollection,
      where('participants', 'array-contains', userId),
      orderBy('lastMessage.timestamp', 'desc')
    );

    this.firestoreSubscription = onSnapshot(q, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      this.chats.set(chatsData);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.firestoreSubscription?.();
  }

  getParticipant(chat: Chat): Participant | undefined {
    const currentUserId = this.currentUser()?.uid;
    return chat.participantInfo.find(p => p.id !== currentUserId);
  }

  onBack(): void {
    this.location.back();
  }

  formatTimeAgo(timestamp: any): string {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval > 24) return Math.floor(interval / 24) + "d";
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "Ahora";
  }
}