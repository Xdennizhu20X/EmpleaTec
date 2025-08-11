import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Job } from '../models/job-card.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private firestore: Firestore = inject(Firestore);

  constructor() { }

  getJobs(): Observable<Job[]> {
    const jobsCollection = collection(this.firestore, 'jobs');
    return collectionData(jobsCollection, { idField: 'id' }) as Observable<Job[]>;
  }

  getUrgentJobs(): Observable<Job[]> {
    const jobsCollection = collection(this.firestore, 'jobs');
    const q = query(jobsCollection, where('timeline.urgency', '==', 'urgent'));
    return collectionData(q, { idField: 'id' }) as Observable<Job[]>;
  }

  getJobById(id: string): Observable<Job> {
    const jobDocRef = doc(this.firestore, `jobs/${id}`);
    return docData(jobDocRef, { idField: 'id' }) as Observable<Job>;
  }
}
