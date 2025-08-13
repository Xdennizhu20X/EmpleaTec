import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { collection, collectionData, doc, docData, Firestore, query, where, getCountFromServer } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  get currentUserProfile$(): Observable<User | null> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return docData(userDocRef) as Observable<User | null>;
        } else {
          return of(null);
        }
      })
    );
  }

  getUserById(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef) as Observable<User | null>;
  }

  getWorkers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('userType', '==', 'worker'), where('isActive', '==', true));
    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }

  async getActiveWorkersCount(): Promise<number> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('userType', '==', 'worker'), where('isActive', '==', true));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }
}