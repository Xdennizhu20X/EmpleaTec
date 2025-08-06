export interface User {
  id: string;
  name: string;
  avatar: string;
  userType: 'worker' | 'client';
  specialty?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: Date; // O podrías usar firebase.firestore.Timestamp
  readBy: string[];
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: number; // Este puede ser un campo calculado en el frontend
  projectTitle: string; // Campo personalizado para la UI
  createdAt: Date;
  updatedAt: Date;
}
