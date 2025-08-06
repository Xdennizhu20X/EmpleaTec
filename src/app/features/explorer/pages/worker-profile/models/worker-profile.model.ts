
export interface Worker {
  // Fields directly from Firebase document
  address: string;
  cedula: string;
  city: string;
  createdAt: Date;
  displayName: string;
  email: string;
  experience: string;
  isActive: boolean;
  lastLogin: Date;
  notifications: {
    messages: boolean;
    newJobs: boolean;
    reviews: boolean;
  };
  oficios: string[];
  phone: string;
  photoURL: string;
  registrationCompleted: boolean;
  uid: string;
  updatedAt: Date;
  userType: string;

  // Original fields from the Worker interface, made optional as they are not directly from Firebase
  id?: string; // Will be mapped from uid
  name?: string; // Will be mapped from displayName
  specialty?: string; // Will be mapped from oficios (if single)
  specialtyIcons?: string[];
  location?: string; // Will be constructed from address and city
  rating?: number;
  jobsCompleted?: number;
  priceRange?: { min: number; max: number };
  bio?: string;
  portfolio?: PortfolioItem[];
  reviews?: Review[];
  isOnline?: boolean;
  isVerified?: boolean;
  avatarUrl?: string; // Will be mapped from photoURL
  coverImageUrl?: string;
}

export interface PortfolioItem {
  imageUrl: string;
  title: string;
  description: string;
  date: Date;
  clientName: string;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: Date;
}
