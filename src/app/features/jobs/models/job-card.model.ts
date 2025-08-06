export interface JobClient {
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  client: JobClient;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    start: string;
    urgency: 'urgent' | 'normal' | 'flexible';
  };
  location: string;
  distance: number;
  applicants: number;
  postedDate: Date;
  requirements: string;
  images: string[];
  status: 'open' | 'urgent' | 'closed';
  requiresPortfolio: boolean;
  featured: boolean;
}
