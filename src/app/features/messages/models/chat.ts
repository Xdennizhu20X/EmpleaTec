export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  userType: 'worker' | 'client';
  specialty?: string;
  isOnline: boolean;
}

export interface LastMessage {
  text: string;
  timestamp: Date;
  senderId: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participant: Participant;
  lastMessage: LastMessage;
  unreadCount: number;
  projectTitle: string;
}
