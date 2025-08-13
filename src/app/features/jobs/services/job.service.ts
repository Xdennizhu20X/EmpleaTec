import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, doc, docData, updateDoc, arrayUnion, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Job, Applicant } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private firestore: Firestore = inject(Firestore);

  constructor() { }

  getJobs(): Observable<Job[]> {
    const jobsCollection = collection(this.firestore, 'jobs');
    return collectionData(jobsCollection, { idField: 'id' as keyof Job }) as Observable<Job[]>;
  }

  getUrgentJobs(): Observable<Job[]> {
    const jobsCollection = collection(this.firestore, 'jobs');
    const q = query(jobsCollection, where('timeline.urgency', '==', 'urgent'));
    return collectionData(q, { idField: 'id' as keyof Job }) as Observable<Job[]>;
  }

  getJobById(id: string): Observable<Job> {
    const jobDocRef = doc(this.firestore, `jobs/${id}`);
    return docData(jobDocRef, { idField: 'id' as keyof Job }) as Observable<Job>;
  }

  getJobsByClientId(clientId: string): Observable<Job[]> {
    const jobsCollection = collection(this.firestore, 'jobs');
    const q = query(jobsCollection, where('clientId', '==', clientId));
    return collectionData(q, { idField: 'id' as keyof Job }) as Observable<Job[]>;
  }

  applyToJob(jobId: string, application: Omit<Applicant, 'status'>): Promise<void> {
    const jobDocRef = doc(this.firestore, `jobs/${jobId}`);
    const newApplication: Applicant = { ...application, status: 'pending' };
    return updateDoc(jobDocRef, {
      applicants: arrayUnion(newApplication)
    });
  }

  async updateApplicantStatus(jobId: string, applicantId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const jobDocRef = doc(this.firestore, `jobs/${jobId}`);
    const jobDoc = await getDoc(jobDocRef);
    if (jobDoc.exists()) {
      const jobData = jobDoc.data() as Job;
      const applicants = jobData.applicants?.map(applicant => {
        if (applicant.applicantId === applicantId) {
          return { ...applicant, status };
        }
        return applicant;
      });
      return updateDoc(jobDocRef, { applicants });
    }
  }
}