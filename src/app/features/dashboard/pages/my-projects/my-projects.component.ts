import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../jobs/services/job.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Job } from '../../../jobs/models/job.model';
import { firstValueFrom } from 'rxjs';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  budgetMin: number | null;
  budgetMax: number | null;
  location: string;
  deadline: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  requirements: string;
}

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.scss']
})
export class MyProjectsComponent implements OnInit {
  private router = inject(Router);
  private jobService = inject(JobService);
  private authService = inject(AuthService);

  searchQuery = signal('');
  statusFilter = signal('all');
  editingProject = signal<Job | null>(null);
  projectData = signal<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    budgetMin: null,
    budgetMax: null,
    location: '',
    deadline: '',
    urgency: 'normal',
    requirements: ''
  });

  private clientProjects = signal<Job[]>([]);

  async ngOnInit(): Promise<void> {
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (user) {
      this.jobService.getJobsByClientId(user.uid).subscribe(projects => {
        this.clientProjects.set(projects);
      });
    }
  }

  filteredProjects = computed(() => {
    const projects = this.clientProjects();
    const query = this.searchQuery().toLowerCase();
    const status = this.statusFilter();

    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(query) ||
                            project.description.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || project.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  stats = computed(() => {
    const projects = this.clientProjects();
    return {
      total: projects.length,
      open: projects.filter(p => p.status === 'open').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length
    };
  });

  getStatusInfo(status: string) {
    switch (status) {
      case 'open':
        return { text: 'Abierto', color: 'bg-green-100 text-green-800 p-2' };
      case 'in_progress':
        return { text: 'En Progreso', color: 'bg-yellow-100 text-yellow-800 p-2' };
      case 'completed':
        return { text: 'Completado', color: 'bg-green-100 text-green-800 p-2' };
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800 p-2' };
      case 'closed':
        return { text: 'Cerrado', color: 'bg-yellow-100 text-yellow-800 p-2' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800 p-2' };
    }
  }

  getUrgencyColor(urgency: string) {
    switch (urgency) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'flexible':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  }

  handleEditProject(project: Job) {
    this.editingProject.set(project);
    this.projectData.set({
      title: project.title,
      description: project.description,
      category: project.category,
      budgetMin: project.budget.min,
      budgetMax: project.budget.max,
      location: project.location,
      deadline: project.timeline.end,
      urgency: project.timeline.urgency,
      requirements: project.requirements,
    });
  }

  handleSaveProject() {
    // Here you would save the project changes
    console.log('Saving project:', this.projectData());
    this.editingProject.set(null);
    // Show success notification
  }

  handleViewProject(project: Job) {
    this.router.navigate(['/project-details', project.id]);
  }

  handleViewApplications(project: Job) {
    // Navigate to job applications screen
  }

  onBack() {
    this.router.navigate(['/dashboard-client']);
  }

  onNavigate(screen: string) {
    this.router.navigate([screen]);
  }

  onLogout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/client-login']);
    });
  }
}
