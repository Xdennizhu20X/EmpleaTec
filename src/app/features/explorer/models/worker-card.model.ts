export interface WorkerCard {
  id: string;
  name: string;
  age: number;
  specialty: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  avatar: string;
  tagline: string;
  isOnline: boolean;
  isVerified: boolean;
  price: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
