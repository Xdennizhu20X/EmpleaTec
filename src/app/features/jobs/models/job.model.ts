export interface Job {
  title: string;
  category: string;
  description: string;
  location: string;
  budget: {
    min: number | null;
    max: number | null;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    start: string; // Usamos string para enlazar con el input de tipo 'date'
    end: string;
    urgency: 'urgent' | 'normal' | 'flexible';
  };
  requirements: string;
  images: string[];
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
