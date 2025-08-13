import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface JobApplication {
  applicantId: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  displayName?: string;
  photoURL?: string;
}

interface JobBudget {
  min: number;
  max: number;
  type: 'fixed' | 'hourly' | 'range';
}

interface JobTimeline {
  start: string;
  end?: string;
  urgency: 'low' | 'normal' | 'urgent';
}

interface Job {
  id: string;
  title: string;
  description: string;
  budget: JobBudget;
  timeline: JobTimeline;
  location: string;
  status: string;
  clientId: string;
  clientName: string;
  images: string[];
  requirements?: string;
  category?: string;
  applicants?: JobApplication[];
  createdAt?: any;
}

interface JobPostulation {
  jobId: string;
  description: string;
  status: string;
  jobData: Job;
}

@Component({
  selector: 'app-my-postulations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-postulations.html',
  styleUrls: ['./my-postulations.scss']
})
export class MyPostulations {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  postulations$: Observable<JobPostulation[]>;

  constructor() {
    this.postulations$ = this.getUserPostulations();
  }

  private getUserPostulations(): Observable<JobPostulation[]> {
    return new Observable<JobPostulation[]>(subscriber => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        if (user) {
          const jobsRef = collection(this.firestore, 'jobs');
          
          collectionData(jobsRef, { idField: 'id' }).pipe(
            map(jobs => {
              const postulations: JobPostulation[] = [];
              jobs.forEach((job: any) => {
                if (job.applicants && Array.isArray(job.applicants)) {
                  job.applicants
                    .filter((app: JobApplication) => app.applicantId === user.uid)
                    .forEach((app: JobApplication) => {
                      postulations.push({
                        jobId: job.id,
                        description: app.description,
                        status: app.status,
                        jobData: job as Job
                      });
                    });
                }
              });
              return postulations;
            })
          ).subscribe({
            next: (postulations: JobPostulation[]) => subscriber.next(postulations),
            error: (err: any) => subscriber.error(err)
          });
        } else {
          subscriber.next([]);
        }
      });

      return () => unsubscribe();
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}