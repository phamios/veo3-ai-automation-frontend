export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  currentPlan?: string; // packageId
  planExpiresAt?: number;
}

export interface Package {
  id: string;
  name: string;
  durationMonths: number;
  originalPrice: number;
  price: number;
  discount: number;
  isPopular?: boolean;
  features?: string[];
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: OrderStatus;
  createdAt: number;
  transferContent: string;
  licenseKey?: string;
  downloadLink?: string;
}

export interface Session {
  userId: string;
  sessionId: string;
  deviceId: string;
  lastActive: number;
}