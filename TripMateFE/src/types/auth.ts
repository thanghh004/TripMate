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
  role: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phoneNumber?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  bio?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string;
  bio?: string;
  avatarUrl?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
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
  role: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  avgRating: number;
  totalReviews: number;
  totalTrips: number;
}
