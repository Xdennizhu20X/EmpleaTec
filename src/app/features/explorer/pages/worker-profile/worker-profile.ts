import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-worker-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './worker-profile.html',
  styleUrls: ['./worker-profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerProfileComponent implements OnInit {
  selectedTab = signal('about');
  isFavorited = signal(false);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private location = inject(Location);

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
    this.location.back();
  }

  toggleFavorite() {
    this.isFavorited.update(fav => !fav);
  }

  // Placeholder for functionality not yet implemented
  handleContactWorker() {
    console.log('Contact worker:', this.worker());
  }

  getSpecialtyName(id: string): string {
    const name = id.charAt(0).toUpperCase() + id.slice(1);
    return name;
  }
}
