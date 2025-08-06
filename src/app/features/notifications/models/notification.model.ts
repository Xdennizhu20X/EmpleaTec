
export interface Notification {
  id: number;
  type: 'message' | 'rating' | 'application' | 'approved' | 'rejected';
  sender: {
    name: string;
    avatar: string;
  };
  title: string;
  description: string;
  read: boolean;
  time: string;
}
