import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Define interfaces based on React code
interface Participant {
  id: string;
  name: string;
  avatar: string;
  specialty?: string;
  isOnline: boolean;
  userType: 'worker' | 'client';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
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

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputRef') private inputRef!: ElementRef<HTMLInputElement>;

  message = '';
  isChatFinalized = false;
  showFinalizationDialog = false;
  showRatingDialog = false;
  finalizationData: ChatFinalizationData = {
    rating: 0,
    comment: '',
    isSubmitted: false,
  };

  messages: Message[] = [];
  currentParticipant: Participant = this.getDefaultParticipant();
  currentProjectTitle = 'Renovación de cocina integral';
  chatId: string | null = null;

  private routeSub!: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.chatId = params['id'];
      // Here you would typically fetch chat data based on chatId
      this.loadInitialMessages();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadInitialMessages(): void {
    // Mock data similar to the React component
    this.messages = [
      {
        id: '1',
        senderId: this.currentParticipant.id,
        senderName: this.currentParticipant.name,
        text: '¡Hola! Vi tu proyecto de renovación de cocina y me parece muy interesante.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: true,
        type: 'text',
      },
      {
        id: '2',
        senderId: 'me',
        senderName: 'Yo',
        text: 'Hola Carlos! Me da mucho gusto que te interese. ¿Tienes experiencia en este tipo de proyectos?',
        timestamp: new Date(Date.now() - 7000000),
        isRead: true,
        type: 'text',
      },
      {
        id: '3',
        senderId: this.currentParticipant.id,
        senderName: this.currentParticipant.name,
        text: 'Sí, tengo más de 12 años trabajando en carpintería. He hecho muchas cocinas similares. Te puedo mostrar algunas fotos de mis trabajos anteriores.',
        timestamp: new Date(Date.now() - 6800000),
        isRead: true,
        type: 'text',
      },
      {
        id: '4',
        senderId: this.currentParticipant.id,
        senderName: this.currentParticipant.name,
        text: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 6700000),
        isRead: true,
        type: 'image',
      },
      {
        id: '5',
        senderId: 'me',
        senderName: 'Yo',
        text: '¡Wow! Se ve increíble el trabajo. Definitivamente me interesa trabajar contigo.',
        timestamp: new Date(Date.now() - 6600000),
        isRead: true,
        type: 'text',
      },
      {
        id: '6',
        senderId: this.currentParticipant.id,
        senderName: this.currentParticipant.name,
        text: 'Perfecto! ¿Cuándo podríamos agendar una visita para ver el espacio y darte un presupuesto más detallado?',
        timestamp: new Date(Date.now() - 6500000),
        isRead: true,
        type: 'text',
      },
      {
        id: '7',
        senderId: 'me',
        senderName: 'Yo',
        text: 'Esta semana tengo disponibilidad. ¿Qué te parece el jueves por la tarde?',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        isRead: false,
        type: 'text',
      },
    ];
  }

  handleSendMessage(): void {
    if (!this.message.trim() || this.isChatFinalized) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Yo',
      text: this.message.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text',
    };

    this.messages.push(newMessage);
    this.message = '';

    if (!this.isChatFinalized) {
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: this.currentParticipant.id,
          senderName: this.currentParticipant.name,
          text: 'Perfecto! El jueves por la tarde me funciona muy bien. ¿A qué hora te queda mejor?',
          timestamp: new Date(),
          isRead: false,
          type: 'text',
        };
        this.messages.push(response);
      }, 2000);
    }
  }

  handleKeyPress(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey && !this.isChatFinalized) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  handleFinalizarChat(): void {
    this.showFinalizationDialog = true;
  }

  confirmFinalizarChat(): void {
    const systemMessage: Message = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'Sistema',
      text: 'El chat ha sido finalizado. Ya no es posible enviar más mensajes.',
      timestamp: new Date(),
      isRead: true,
      type: 'system',
    };

    this.messages.push(systemMessage);
    this.isChatFinalized = true;
    this.showFinalizationDialog = false;

    setTimeout(() => {
      this.showRatingDialog = true;
    }, 1000);
  }

  handleSubmitRating(): void {
    if (this.finalizationData.rating === 0) return;

    console.log('Rating submitted:', {
      participantId: this.currentParticipant.id,
      rating: this.finalizationData.rating,
      comment: this.finalizationData.comment,
      chatId: this.chatId || 'default-chat',
      timestamp: new Date(),
    });

    this.finalizationData.isSubmitted = true;

    setTimeout(() => {
      this.showRatingDialog = false;
      // this.router.navigate(['/messages']);
    }, 2000);
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDateHeader(date: Date): string {
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

  shouldShowDateHeader(currentMessage: Message, previousMessage: Message): boolean {
    if (!previousMessage) return true;
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    return currentDate !== previousDate;
  }

  onBack(): void {
    this.router.navigate(['/messages']);
  }

  onNavigate(screen: string, data?: any): void {
    // Implement navigation logic as needed
    // e.g., this.router.navigate([screen, data.id]);
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  private getDefaultParticipant(): Participant {
    return {
      id: '1',
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      specialty: 'Carpintería',
      isOnline: true,
      userType: 'worker',
    };
  }
}