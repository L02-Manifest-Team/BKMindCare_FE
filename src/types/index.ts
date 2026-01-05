export type UserRole = 'student' | 'doctor' | 'admin';

export type MoodType = 'HAPPY' | 'SAD' | 'ANXIOUS' | 'STRESSED' | 'CALM' | 'ANGRY' | 'TIRED' | 'EXCITED';

export type AppointmentType = 'in-person' | 'video-call';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  avatar?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: AppointmentType;
  location?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface MoodCheckIn {
  id: string;
  userId: string;
  mood: MoodType;
  date: string;
  timestamp: number;
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name?: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  type: 'appointment' | 'message';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

