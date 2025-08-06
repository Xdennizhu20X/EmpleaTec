export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  clientName: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    start: string;
    end?: string;
    urgency: 'urgent' | 'normal' | 'flexible';
  };
  location: string;
  createdAt: any;
  requirements: string;
  images: string[];
  status: 'open' | 'urgent' | 'closed';
}
