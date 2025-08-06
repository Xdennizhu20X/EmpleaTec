import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { JobService } from '../../../jobs/services/job.service';
import { Job } from '../../../jobs/models/job-card.model';
import { Observable } from 'rxjs';

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

  activeSpecialty: string = 'todos';

  private jobService = inject(JobService);

  ngOnInit(): void {
    this.jobOffers$ = this.jobService.getUrgentJobs();
  }

  setActiveSpecialty(specialtyId: string) {
    this.activeSpecialty = specialtyId;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
