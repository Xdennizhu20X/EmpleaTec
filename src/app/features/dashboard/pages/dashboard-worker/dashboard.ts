import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JobService } from '../../../jobs/services/job.service';
import { Job } from '../../../jobs/models/job-card.model';
import { Observable } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

interface Specialty {
  id: string;
  name: string;
  jobCount: number;
}

@Component({
  selector: 'app-dashboard-worker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardWorker implements OnInit {
  isSidebarOpen = false;
  specialties: Specialty[] = [
    { id: 'todos', name: 'Todos los Trabajos', jobCount: 89 },
    { id: 'carpinteria', name: '🔨 Carpintería', jobCount: 25 },
    { id: 'plomeria', name: '🔧 Plomería', jobCount: 18 },
    { id: 'electricidad', name: '⚡ Electricidad', jobCount: 15 },
    { id: 'albanileria', name: '🧱 Albañilería', jobCount: 12 },
    { id: 'pintura', name: '🎨 Pintura', jobCount: 10 },
    { id: 'jardineria', name: '🌳 Jardinería', jobCount: 9 },
    { id: 'limpieza', name: '🧹 Limpieza', jobCount: 6 },
  ];

  jobOffers$!: Observable<Job[]>;
  user$!: Observable<User | null>;

  activeSpecialty: string = 'todos';

  private jobService = inject(JobService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.jobOffers$ = this.jobService.getUrgentJobs();
    this.user$ = this.userService.currentUserProfile$;
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  setActiveSpecialty(specialtyId: string) {
    this.activeSpecialty = specialtyId;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
