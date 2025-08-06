import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, User as FirebaseAuthUser } from '@angular/fire/auth';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  userType: 'worker' | 'client';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore) { }

  signUp(email: string, password: string): Promise<any> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signInWithGoogle(): Promise<any> {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  getCurrentUser(): Observable<FirebaseAuthUser | null> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged((user: FirebaseAuthUser | null) => {
        observer.next(user);
      });
    });
  }

  getUserProfile(): Observable<UserProfile | null> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return docData(userDocRef) as Observable<UserProfile>;
        } else {
          return of(null);
        }
      })
    );
  }
}
