export interface Contestant {
  id: string;
  name: string;
  bio: string;
  category: string;
  photoUrl: string;
  votes: number;
  linkedinUrl?: string;
  isVisible: boolean;
  status: 'active' | 'withdrawn';
  email: string; // Contact email (hidden from public UI)
  contestId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  coverPhotoUrl: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  contestId: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'ended' | 'paused';
  bannerUrl: string;
}

export interface VoteRecord {
  id: string;
  email: string;
  contestantId: string;
  contestId: string;
  timestamp: number;
  status: 'pending' | 'verified' | 'rejected';
  ipAddress?: string;
}

export interface UserSession {
  isAdmin: boolean;
  email?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  status: 'active' | 'invited' | 'inactive';
  lastLogin: string; // ISO date string or empty
}

export enum VoteStatus {
  IDLE,
  SENDING_OTP,
  AWAITING_OTP,
  VERIFYING,
  SUCCESS,
  ERROR
}