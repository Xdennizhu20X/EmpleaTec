import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../../models/job-card.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jobs-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs-explorer.html',
  styleUrls: ['./jobs-explorer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsExplorerComponent {
  // --- State Signals ---
  searchQuery = signal('');
  selectedJob = signal<Job | null>(null);
  showFilters = signal(false);
  appliedJobs = signal<string[]>([]);
  private router = inject(Router);

  // --- Filters State ---
  filters = signal({
    budgetRange: [0, 50000],
    urgentOnly: false,
    maxDistance: 10,
    recentOnly: false,
    requiresPortfolio: false,
    sortBy: 'recent',
  });

  // --- Mock Data ---
  private readonly userSpecialties = ['carpinteria', 'plomeria'];
  private readonly allJobs: Job[] = [
    { id: '1', title: 'Renovación completa de cocina', description: 'Necesito renovar completamente mi cocina. Incluye demolición, instalación de muebles nuevos, plomería y electricidad básica.', category: 'carpinteria', client: { name: 'Ana Rodríguez', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=100&h=100&fit=crop&crop=face', rating: 4.8, reviewCount: 12, location: 'Polanco, CDMX' }, budget: { min: 15000, max: 25000, type: 'fixed' }, timeline: { start: '2024-05-01', urgency: 'normal' }, location: 'Polanco, Ciudad de México', distance: 2.3, applicants: 8, postedDate: new Date(Date.now() - 86400000 * 2), requirements: 'Experiencia mínima 5 años, referencias verificables, seguro de responsabilidad civil', images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'], status: 'open', requiresPortfolio: true, featured: true },
    { id: '2', title: 'Reparación de fuga en baño principal', description: 'Tengo una fuga en la tubería del baño principal que está causando daños. Necesito reparación urgente.', category: 'plomeria', client: { name: 'Luis Martínez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', rating: 4.9, reviewCount: 8, location: 'Roma Norte, CDMX' }, budget: { min: 2000, max: 5000, type: 'fixed' }, timeline: { start: '2024-04-25', urgency: 'urgent' }, location: 'Roma Norte, Ciudad de México', distance: 1.8, applicants: 12, postedDate: new Date(Date.now() - 86400000), requirements: 'Disponibilidad inmediata, herramientas propias', images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'], status: 'urgent', requiresPortfolio: false, featured: false },
  ];

  // --- Computed Signals for Filtering and Sorting ---
  readonly filteredJobs = computed(() => {
    const f = this.filters();
    const sq = this.searchQuery().toLowerCase();

    return this.allJobs
      .filter(job => {
        if (!this.userSpecialties.includes(job.category)) return false;
        if (sq && !job.title.toLowerCase().includes(sq) && !job.description.toLowerCase().includes(sq)) return false;
        if (job.budget.max < f.budgetRange[0] || job.budget.min > f.budgetRange[1]) return false;
        if (f.urgentOnly && job.timeline.urgency !== 'urgent') return false;
        if (job.distance > f.maxDistance) return false;
        if (f.recentOnly && (Date.now() - job.postedDate.getTime()) > (3 * 24 * 60 * 60 * 1000)) return false;
        if (f.requiresPortfolio && !job.requiresPortfolio) return false;
        return true;
      })
      .sort((a, b) => {
        switch (f.sortBy) {
          case 'budget': return b.budget.max - a.budget.max;
          case 'distance': return a.distance - b.distance;
          case 'urgent': return (a.timeline.urgency === 'urgent' ? -1 : 1) - (b.timeline.urgency === 'urgent' ? -1 : 1);
          default: return b.postedDate.getTime() - a.postedDate.getTime();
        }
      });
  });

  // --- Methods ---
  handleFilterChange<T extends keyof typeof this.filters.prototype>(filterName: T, value: any): void {
    this.filters.update(prev => ({ ...prev, [filterName]: value }));
  }

  clearFilters(): void {
    this.filters.set({
      budgetRange: [0, 50000],
      urgentOnly: false,
      maxDistance: 10,
      recentOnly: false,
      requiresPortfolio: false,
      sortBy: 'recent',
    });
  }

  handleApply(jobId: string): void {
    this.appliedJobs.update(prev => [...prev, jobId]);
    this.selectedJob.set(null);
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    return `Hace ${diffInDays} días`;
  }

  onBack(): void {
    this.router.navigate(['/dashboard-worker']);
  }
}
