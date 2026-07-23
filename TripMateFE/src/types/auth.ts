export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  fullName: string;
  email: string;
  role: string | number;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export const UserRole = {
  User: 0,
  Admin: 1,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: string | number;
  avatarUrl?: string;
  phoneNumber?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  bio?: string;
  hostRejectReason?: string;
}

export const HostVerificationStatus = {
  Unverified: 0,
  Pending: 1,
  Approved: 2,
  Rejected: 3,
} as const;

export type HostVerificationStatus = (typeof HostVerificationStatus)[keyof typeof HostVerificationStatus];

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string;
  bio?: string;
  avatarUrl?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  identityCardNumber?: string;
}

export interface UserProfileResponse {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string;
  avatarUrl?: string;
  bio?: string;
  role: string | number;
  status?: number;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  identityCardNumber?: string;
  hostVerificationStatus: HostVerificationStatus;
  hostRejectReason?: string;
  avgRating: number;
  totalReviews: number;
  totalTrips: number;
}
