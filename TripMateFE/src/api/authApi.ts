import { axiosClient } from './axiosClient';
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '../types/auth';

export const authApi = {
  // API 1: Đăng ký tài khoản người dùng
  register: async (data: RegisterRequest): Promise<ApiResponse<{ userId: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ userId: string }>>('/api/auth/register', data);
    return res.data;
  },

  // API 2: Xác thực mã OTP qua Email
  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>('/api/auth/verify-otp', data);
    return res.data;
  },

  // API 3: Đăng nhập bằng Email & Mật khẩu
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    return res.data;
  },

  // API 4: Đăng nhập bằng Google (Google SSO)
  googleLogin: async (data: GoogleLoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/api/auth/google-login', data);
    return res.data;
  },

  // API 5: Làm mới Access Token (Refresh Token)
  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/api/auth/refresh-token', data);
    return res.data;
  },

  // API 6: Gửi yêu cầu mã OTP quên mật khẩu
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>('/api/auth/forgot-password', data);
    return res.data;
  },

  // API 7: Đặt lại mật khẩu mới bằng OTP
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>('/api/auth/reset-password', data);
    return res.data;
  },
};
