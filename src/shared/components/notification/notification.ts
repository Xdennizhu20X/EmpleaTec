import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateY(0) scale(1)',
        opacity: 1
      })),
      transition(':enter', [
        style({
          transform: 'translateY(-100%) scale(0.9)',
          opacity: 0
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          transform: 'translateY(-100%) scale(0.9)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnChanges {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Input() isVisible: boolean = false;
  @Output() closed = new EventEmitter<void>();

  private timer: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.close();
      }, 5000); 
    }
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }
}
