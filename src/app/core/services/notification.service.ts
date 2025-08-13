import { Injectable, signal, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';

export interface Notification {
  id?: string;
  userId: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'message' | 'rating' | 'application' | 'approved' | 'rejected';
  sender?: {
    name: string;
    avatar: string;
  };
  title?: string;
  description?: string;
  isRead: boolean;
  createdAt: any;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private notificationSignal = signal<{ message: string; type: 'success' | 'error'; isVisible: boolean; }>({ message: '', type: 'success', isVisible: false });

  public readonly notificationState = this.notificationSignal.asReadonly();

  private async addNotification(message: string, type: 'success' | 'error' | 'info' | 'message', options?: Partial<Notification>) {
    const user = await firstValueFrom(this.authService.getCurrentUser());
    let targetUserId: string | undefined;
    if (options?.userId) {
      targetUserId = options.userId;
    } else {
      targetUserId = user?.uid;
    }

    if (targetUserId) {
      await addDoc(collection(this.firestore, 'notifications'), {
        userId: targetUserId,
        message,
        type,
        title: options?.title || message,
        description: options?.description || message,
        sender: options?.sender || {
          name: user?.displayName || 'Sistema',
          avatar: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        createdAt: serverTimestamp(),
        isRead: false
      });
    }
  }

  getNotificationsForCurrentUser(): Observable<Notification[]> {
    return new Observable(subscriber => {
      this.authService.getCurrentUser().subscribe(user => {
        if (!user) {
          subscriber.next([]);
          return;
        }
        const q = query(
          collection(this.firestore, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, querySnapshot => {
          const notifications: Notification[] = [];
          querySnapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() } as Notification);
          });
          subscriber.next(notifications);
        });
        return () => unsubscribe();
      });
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notifDocRef = doc(this.firestore, 'notifications', notificationId);
    await updateDoc(notifDocRef, { isRead: true });
  }

  async markAllAsRead(): Promise<void> {
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (!user) return;

    const q = query(
      collection(this.firestore, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    const batch: Promise<void>[] = [];
    querySnapshot.forEach(document => {
      batch.push(updateDoc(doc(this.firestore, 'notifications', document.id), { isRead: true }));
    });
    await Promise.all(batch);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'notifications', notificationId));
  }


  private show(message: string, type: 'success' | 'error') {
    this.notificationSignal.set({ message, type, isVisible: true });

    setTimeout(() => {
      this.hide();
    }, 5000); // Ocultar automáticamente después de 5 segundos
  }

  showSuccess(message: string) {
    this.addNotification(message, 'success');
    this.show(message, 'success');
  }

  showError(message: string) {
    this.addNotification(message, 'error');
    this.show(message, 'error');
  }

  showChatNotification(message: string, recipientId: string, sender: { name: string, avatar: string }) {
    this.addNotification(message, 'message', {
      userId: recipientId,
      title: `Nuevo mensaje de ${sender.name}`,
      description: message,
      sender
    });
  }

  hide() {
    this.notificationSignal.update(state => ({ ...state, isVisible: false }));
  }
}
