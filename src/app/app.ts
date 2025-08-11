import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { NotificationComponent } from './shared/components/notification/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  public notificationService = inject(NotificationService);
  readonly notificationState = this.notificationService.notificationState;

  onNotificationClose() {
    this.notificationService.hide();
  }
}
