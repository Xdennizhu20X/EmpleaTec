export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  clientName: string;
  budget: {
    min: number | null;
    max: number | null;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    start: string;
    end: string;
    urgency: 'urgent' | 'normal' | 'flexible';
  };
  location: string;
  createdAt: any;
  requirements: string;
  images: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'urgent' | 'closed';
  applicants?: Applicant[];
  requiresPortfolio?: boolean;
}

export interface Applicant {
  applicantId: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  displayName?: string;
  photoURL?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface UrgencyLevel {
  id: 'urgent' | 'normal' | 'flexible';
  name: string;
  description: string;
  color: string;
}
