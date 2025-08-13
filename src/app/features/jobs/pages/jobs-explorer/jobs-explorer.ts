import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../../models/job.model';
import { Router, RouterModule } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-jobs-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs-explorer.html',
  styleUrls: ['./jobs-explorer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsExplorerComponent implements OnInit {
  // --- State Signals ---
  searchQuery = signal('');
  selectedJob = signal<Job | null>(null);
  showFilters = signal(false);
  appliedJobs = signal<string[]>([]);
  private router = inject(Router);
  private jobService = inject(JobService);

  // --- Filters State ---
  filters = signal({
    budgetRange: [0, 50000],
    urgentOnly: false,
    maxDistance: 10,
    recentOnly: false,
    sortBy: 'recent',
  });

  // --- Data ---
  private allJobs = signal<Job[]>([]);

  ngOnInit(): void {
    this.jobService.getJobs().subscribe(jobs => {
      this.allJobs.set(jobs);
    });
  }

  // --- Computed Signals for Filtering and Sorting ---
    // --- Computed Signals for Filtering and Sorting ---
  readonly filteredJobs = computed(() => {
    const f = this.filters();
    const sq = this.searchQuery().toLowerCase();

    return this.allJobs()
      .filter(job => {
        if (sq && !job.title.toLowerCase().includes(sq) && !job.description.toLowerCase().includes(sq)) return false;
        if (f.urgentOnly && job.timeline.urgency !== 'urgent') return false;
        return true;
      })
      .sort((a, b) => {
        switch (f.sortBy) {
          case 'budget': return (b.budget.max || 0) - (a.budget.max || 0);
          case 'urgent': return (a.timeline.urgency === 'urgent' ? -1 : 1) - (b.timeline.urgency === 'urgent' ? -1 : 1);
          default: return b.createdAt.toMillis() - a.createdAt.toMillis();
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
