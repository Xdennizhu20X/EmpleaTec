import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

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

  getCurrentUser(): Observable<User | null> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged((user: User | null) => {
        observer.next(user);
      });
    });
  }
}