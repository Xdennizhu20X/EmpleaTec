import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JobService } from '../../../jobs/services/job.service';
import { Job } from '../../../jobs/models/job.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  specialties: Specialty[] = [];

  jobOffers$!: Observable<Job[]>;
  filteredJobOffers$!: Observable<Job[]>;
  user$!: Observable<User | null>;

  activeSpecialty: string = 'todos';

  private jobService = inject(JobService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  ngOnInit(): void {
    this.user$ = this.userService.currentUserProfile$;

    this.user$.subscribe(user => {
      if (user && user.oficios) {
        this.jobService.getJobs().subscribe(jobs => {
          const oficios = user.oficios || [];
          this.specialties = [
            { id: 'todos', name: 'Todos los Trabajos', jobCount: jobs.length },
            ...oficios.map(oficio => ({
              id: oficio,
              name: oficio,
              jobCount: jobs.filter(job => this.normalizeString(job.category) === this.normalizeString(oficio)).length
            }))
          ];
        });

        this.jobOffers$ = this.jobService.getJobs().pipe(
          map((jobs: Job[]) => jobs.filter((job: Job) => user.oficios!.map(o => this.normalizeString(o)).includes(this.normalizeString(job.category))))
        );
        this.filteredJobOffers$ = this.jobOffers$;
      }
    });
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
    if (specialtyId === 'todos') {
      this.filteredJobOffers$ = this.jobOffers$;
    } else {
      this.filteredJobOffers$ = this.jobOffers$.pipe(
        map(jobs => jobs.filter(job => this.normalizeString(job.category) === this.normalizeString(specialtyId)))
      );
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
