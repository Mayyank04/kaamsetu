export type UserRole =
  | "worker"
  | "contractor"
  | "employer"
  | "verifier"
  | "admin";

export interface UserProfile {
  id: string;
  phone?: string;
  email?: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  isPhoneVerified: boolean;
  isDigiLockerVerified: boolean;
  slug?: string;
  trade?: string;
  registryId?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
