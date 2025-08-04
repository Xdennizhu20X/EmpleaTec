import { Injectable, inject } from '@angular/core';
import { Storage, getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storage: Storage = inject(Storage);

  constructor() { }

  uploadProfilePhoto(userId: string, file: File): Observable<string> {
    const storageRef = ref(this.storage, `profile-photos/${userId}`);
    return from(uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref)));
  }
}