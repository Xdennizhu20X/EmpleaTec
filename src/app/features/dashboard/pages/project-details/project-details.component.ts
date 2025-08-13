import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../jobs/services/job.service';
import { Job, Applicant } from '../../../jobs/models/job.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);

  project$!: Observable<Job>;
  currentImageIndex = 0;

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.project$ = this.jobService.getJobById(projectId);
    }
  }

  onBack() {
    this.router.navigate(['/my-projects']);
  }

  getStatusInfo(status: string) {
    switch (status) {
      case 'open':
        return { text: 'Abierto', color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { text: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { text: 'Completado', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  }

  getApplicationStatusInfo(status: string) {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
      case 'accepted':
        return { text: 'Aceptado', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { text: 'Rechazado', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  }

  getUrgencyInfo(urgency: string) {
    switch (urgency) {
      case 'urgent':
        return { text: 'Urgente', color: 'bg-red-100 text-red-800' };
      case 'normal':
        return { text: 'Normal', color: 'bg-yellow-100 text-yellow-800' };
      case 'flexible':
        return { text: 'Flexible', color: 'bg-green-100 text-green-800' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  }

  updateApplicantStatus(projectId: string, applicantId: string, status: 'accepted' | 'rejected') {
    this.jobService.updateApplicantStatus(projectId, applicantId, status);
  }

  acceptedWorkers(applicants: Applicant[] = []) {
    return applicants.filter(applicant => applicant.status === 'accepted');
  }

  nextImage(project: Job) {
    if (this.currentImageIndex < project.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }
}