import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSignal = signal<Notification>({ message: '', type: 'success', isVisible: false });

  public readonly notificationState = this.notificationSignal.asReadonly();

  private show(message: string, type: 'success' | 'error') {
    this.notificationSignal.set({ message, type, isVisible: true });

    setTimeout(() => {
      this.hide();
    }, 5000); // Ocultar automáticamente después de 5 segundos
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showError(message: string) {
    this.show(message, 'error');
  }

  hide() {
    this.notificationSignal.update(state => ({ ...state, isVisible: false }));
  }
}
