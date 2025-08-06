export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  client: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  projectTitle: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface WorkerProfile {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  avatar: string;
  coverImage: string;
  price: string;
  isVerified: boolean;
  isOnline: boolean;
  completedJobs: number;
  yearsExperience: number;
  specialties: string[];
  bio: string;
  portfolio: PortfolioItem[];
  reviews: Review[];
}
