import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../jobs/services/job.service';
import { Job, Applicant } from '../../../jobs/models/job.model';
import { Observable } from 'rxjs';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, addDoc, serverTimestamp } from '@angular/fire/firestore';

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
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  project$!: Observable<Job | undefined>;
  currentImageIndex = 0;

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.project$ = this.jobService.getJobById(projectId);
    }
  }

  async contactWorker(worker: Applicant, projectTitle: string): Promise<void> {
    const currentUser = await new Promise<any>(resolve => {
      user(this.auth).subscribe(user => resolve(user));
    });

    if (!currentUser) return;

    const chatsCollection = collection(this.firestore, 'chats');
    const participants = [currentUser.uid, worker.applicantId].sort();

    const q = query(
      chatsCollection,
      where('participants', '==', participants),
      where('projectTitle', '==', projectTitle)
    );

    const existingChatSnapshot = await getDocs(q);

    if (!existingChatSnapshot.empty) {
      const chatId = existingChatSnapshot.docs[0].id;
      this.router.navigate(['/chat', chatId]);
    } else {
      const newChat = {
        participants,
        participantInfo: [
          { id: currentUser.uid, name: currentUser.displayName || 'Tú', avatar: currentUser.photoURL || '' },
          { id: worker.applicantId, name: worker.displayName, avatar: worker.photoURL || '' }
        ],
        projectTitle,
        lastMessage: { text: 'Inicia la conversación!', timestamp: serverTimestamp() },
        unreadCount: 0
      };
      const docRef = await addDoc(chatsCollection, newChat);
      this.router.navigate(['/chat', docRef.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/my-projects']);
  }

  viewWorkerProfile(workerId: string): void {
    this.router.navigate(['/worker', workerId]);
  }

  getStatusInfo(status: string | undefined): { text: string; color: string } {
    switch (status) {
      case 'open':
        return { text: 'Abierto', color: 'bg-green-100 text-green-800 p-2 rounded-xl' };
      case 'in_progress':
        return { text: 'En Progreso', color: 'bg-yellow-100 text-yellow-800 p-2 rounded-xl' };
      case 'completed':
        return { text: 'Completado', color: 'bg-green-100 text-green-800 p-2 rounded-xl' };
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800 p-2 rounded-xl' };
      case 'closed':
        return { text: 'Cerrado', color: 'bg-yellow-100 text-yellow-800 p-2 rounded-xl' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800 p-2 rounded-xl' };
    }
  }


  getApplicationStatusInfo(status: string | undefined): { text: string; color: string } {
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

  getUrgencyInfo(urgency: string | undefined): { text: string; color: string } {
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

  updateApplicantStatus(projectId: string, applicantId: string, status: 'accepted' | 'rejected'): void {
    this.jobService.updateApplicantStatus(projectId, applicantId, status);
  }

  closeProject(projectId: string): void {
    this.jobService.updateJobStatus(projectId, 'closed');
  }

  finishProject(projectId: string): void {
    this.jobService.updateJobStatus(projectId, 'completed');
  }

  acceptedWorkers(applicants: Applicant[] | undefined): Applicant[] {
    if (!applicants) {
      return [];
    }
    return applicants.filter(applicant => applicant.status === 'accepted');
  }

  nextImage(project: Job): void {
    if (this.currentImageIndex < project.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }
}
