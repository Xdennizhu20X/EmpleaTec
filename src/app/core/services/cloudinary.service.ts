import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError, of, lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

export interface CloudinaryUploadResponse {
  event?: HttpEvent<any>;
  progress?: number;
  url?: string;
  error?: any;
  status?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  private readonly cloudName = environment.cloudinary.cloudName;
  private readonly uploadPreset = environment.cloudinary.uploadPreset;
  private readonly apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

  /**
   * Uploads a file to Cloudinary with progress reporting
   * @param file The file to upload
   * @param folder Optional folder in Cloudinary
   * @returns Observable with upload progress and final result
   */
  uploadFile(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    if (!file) {
      return throwError(() => new Error('No file provided'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    if (folder) {
      formData.append('folder', folder);
    }

    return this.http.post<{ secure_url: string }>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => this.handleUploadError(error))
    );
  }

  private handleUploadEvent(event: HttpEvent<any>): CloudinaryUploadResponse {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        const progress = event.total 
          ? Math.round((100 * event.loaded) / event.total)
          : 0;
        return { progress, event };
      
      case HttpEventType.Response:
        return {
          progress: 100,
          url: event.body?.secure_url,
          status: event.status
        };
      
      default:
        return { event };
    }
  }

  private handleUploadError(error: any): Observable<CloudinaryUploadResponse> {
    console.error('Cloudinary upload error:', error);
    const errorResponse = {
      error: error.error?.message || error.message || 'Unknown upload error',
      status: error.status || 0,
      progress: 0
    };
    return of(errorResponse);
  }

  /**
   * Simple upload without progress reporting
   * @param file File to upload
   * @param folder Optional target folder
   * @returns Promise with the secure URL
   */
  async uploadImage(file: File, folder?: string): Promise<{ secure_url: string }> {
    if (!file) {
      throw new Error('No file provided');
    }

    try {
      const response = await lastValueFrom(this.uploadFile(file, folder));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.url) {
        throw new Error('No URL returned from Cloudinary');
      }
      
      return { secure_url: response.url };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }
}