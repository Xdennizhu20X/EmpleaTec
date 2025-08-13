import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '@angular/fire/auth';
import { UserService } from '../../../../core/services/user.service';
import { Firestore, doc, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy, Timestamp, updateDoc } from '@angular/fire/firestore';
import { NotificationService } from '../../../../core/services/notification.service';
import { firstValueFrom, Subscription } from 'rxjs';

// --- Interfaces ---
interface Participant {
  id: string;
  name: string;
  avatar: string;
  specialty?: string;
  isOnline: boolean;
  userType: 'worker' | 'client';
}

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
  isRead: boolean;
  type: 'text' | 'image' | 'system';
}

interface ChatFinalizationData {
  rating: number;
  comment: string;
  isSubmitted: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.html',
  styleUrls: ['./chat-screen.scss']
})
export class ChatScreen implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private firestore: Firestore = inject(Firestore);
  private location = inject(Location);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  message = signal('');
  messages = signal<Message[]>([]);
  currentParticipant = signal<Participant | null>(null);
  currentProjectTitle = signal('');
  chatId = signal<string | null>(null);
  currentUser = signal<User | null>(null);
  isChatFinalized = signal(false);

  showFinalizationDialog = signal(false);
  showRatingDialog = signal(false);
  finalizationData = signal<ChatFinalizationData>({
    rating: 0,
    comment: '',
    isSubmitted: false,
  });

  private routeSub: Subscription | undefined;
  private messagesSub: (() => void) | undefined;
  private chatSub: (() => void) | undefined;

  constructor() {
    effect(() => {
      if (this.messages()) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
      // Now that currentUser is set, we can safely load chat data
      this.routeSub = this.route.params.subscribe(params => {
        const chatId = params['id'];
        if (chatId) {
          this.chatId.set(chatId);
          this.loadChatData(chatId);
          this.listenToMessages(chatId);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.messagesSub?.();
    this.chatSub?.();
  }

  loadChatData(chatId: string) {
    const currentUser = this.currentUser(); // Get the current user
    if (!currentUser) {
      console.error('Current user not available in loadChatData');
      return; // Should not happen with the new ngOnInit structure
    }

    const chatDocRef = doc(this.firestore, 'chats', chatId);
    this.chatSub = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const chatData = docSnap.data();
        this.currentProjectTitle.set(chatData['projectTitle']);
        this.isChatFinalized.set(chatData['isFinalized'] || false);
        const participantInfo = chatData['participantInfo'] as any[];
        console.log('Participant Info:', participantInfo);

        // Filter to find the other participant
        const otherParticipants = participantInfo.filter(p => {
          console.log('  Filtering: p.id =', p.id, ', currentUser.uid =', currentUser.uid, ', p.id !== currentUser.uid =', p.id !== currentUser.uid);
          return p.id !== currentUser.uid;
        });
        const otherParticipantData = otherParticipants.length > 0 ? otherParticipants[0] : undefined;

        console.log('Other Participant Data:', otherParticipantData);
        if (otherParticipantData) {
          this.currentParticipant.set({
            id: otherParticipantData.id,
            name: otherParticipantData.name,
            avatar: otherParticipantData.avatar,
            isOnline: true, // This needs a presence system
            userType: 'worker' // This should be dynamic
          });
        } else {
          console.warn('Other participant data not found for chat:', chatId);
          // Handle case where other participant is not found (e.g., redirect to messages list)
        }
      }
    });
  }

  listenToMessages(chatId: string) {
    const messagesCollection = collection(this.firestore, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    this.messagesSub = onSnapshot(q, (querySnapshot) => {
      const newMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      this.messages.set(newMessages);
    });
  }

    async handleSendMessage() {
    const messageText = this.message().trim();
    const user = this.currentUser();
    if (!messageText || !this.chatId() || !user || this.isChatFinalized()) return;

    const userProfile = await firstValueFrom(this.userService.getUserById(user.uid));

    const messagesCollection = collection(this.firestore, 'chats', this.chatId()!, 'messages');
    const chatDocRef = doc(this.firestore, 'chats', this.chatId()!);

    try {
      await addDoc(messagesCollection, {
        senderId: user.uid,
        senderName: userProfile?.displayName || 'Yo',
        text: messageText,
        timestamp: serverTimestamp(),
        isRead: false,
        type: 'text'
      });

      // Update last message on chat document
      await updateDoc(chatDocRef, {
        'lastMessage.text': messageText,
        'lastMessage.timestamp': serverTimestamp()
      });

      // Send notification to the other participant
      const recipient = this.currentParticipant();
      if (recipient) {
        this.notificationService.showChatNotification(
          messageText,
          recipient.id,
          {
            name: userProfile?.displayName || 'Usuario Anónimo',
            avatar: userProfile?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
          }
        );
      }

      this.message.set('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !this.isChatFinalized()) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  handleFinalizarChat(): void {
    this.showFinalizationDialog.set(true);
  }

  async confirmFinalizarChat() {
    if (!this.chatId()) return;
    const chatDocRef = doc(this.firestore, 'chats', this.chatId()!);
    const systemMessage = {
        senderId: 'system',
        senderName: 'Sistema',
        text: 'El chat ha sido finalizado. Ya no es posible enviar más mensajes.',
        timestamp: serverTimestamp(),
        isRead: true,
        type: 'system' as const
    };
    const messagesCollection = collection(this.firestore, 'chats', this.chatId()!, 'messages');
    await addDoc(messagesCollection, systemMessage);
    await updateDoc(chatDocRef, { isFinalized: true });

    this.isChatFinalized.set(true);
    this.showFinalizationDialog.set(false);
    setTimeout(() => this.showRatingDialog.set(true), 1000);
  }

  async handleSubmitRating() {
    const ratingData = this.finalizationData();
    if (ratingData.rating === 0) return;

    console.log('Rating submitted:', {
      participantId: this.currentParticipant()?.id,
      rating: ratingData.rating,
      comment: ratingData.comment,
      chatId: this.chatId() || 'default-chat',
      timestamp: new Date(),
    });
    // Here you would typically save the rating to Firestore
    
    this.finalizationData.update(data => ({ ...data, isSubmitted: true }));
    setTimeout(() => {
      this.showRatingDialog.set(false);
      // this.router.navigate(['/messages']);
    }, 2000);
  }

  updateFinalizationComment(comment: string): void {
    this.finalizationData.update(data => ({ ...data, comment }));
  }

  formatMessageTime(timestamp: Timestamp): string {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDateHeader(timestamp: Timestamp): string {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  shouldShowDateHeader(currentMessage: Message, previousMessage?: Message): boolean {
    if (!previousMessage) return true;
    if (!currentMessage.timestamp?.toDate || !previousMessage.timestamp?.toDate) return false;
    const currentDate = currentMessage.timestamp.toDate().toDateString();
    const previousDate = previousMessage.timestamp.toDate().toDateString();
    return currentDate !== previousDate;
  }

  onBack(): void {
    this.location.back();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 100);
  }
}
