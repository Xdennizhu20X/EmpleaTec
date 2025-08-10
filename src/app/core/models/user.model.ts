import { Timestamp } from "@angular/fire/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: 'worker' | 'client' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  notifications: {
    newJobs: boolean;
    messages: boolean;
    reviews: boolean;
  };
  address?: string;
  cedula?: string;
  city?: string;
  experience?: string;
  oficios?: string[];
  phone?: string;
  registrationCompleted?: boolean;
  lastLogin?: Timestamp;
}