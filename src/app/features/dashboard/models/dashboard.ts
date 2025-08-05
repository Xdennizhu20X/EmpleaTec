
export interface WorkerCard {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviewCount: number;
    location: string;
    price: number;
    avatar: string;
    coverImage: string;
    isVerified: boolean;
    isOnline: boolean;
  }
  
  export interface Category {
    id: string;
    name: string;
    icon?: string;
    count: number;
  }
  