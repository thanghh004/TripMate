import { axiosClient } from './axiosClient';
import type { ApiResponse, UpdateProfileRequest, UserProfileResponse } from '../types/auth';
import type { AdminUserListItem } from '../types/admin';

export const userApi = {
  // API 1: Lấy thông tin hồ sơ đầy đủ của người dùng hiện tại từ DB
  getProfile: async (): Promise<ApiResponse<UserProfileResponse>> => {
    const res = await axiosClient.get<ApiResponse<UserProfileResponse>>('/api/users/me');
    return res.data;
  },

  // API 2: Upload ảnh (avatar, CCCD...) lên server — multipart/form-data
  uploadFile: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosClient.post<ApiResponse<{ url: string }>>(
      '/api/users/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  // API 3: Cập nhật thông tin cá nhân người dùng
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.put<ApiResponse<{ isSuccess: boolean }>>(
      '/api/users/profile',
      data
    );
    return res.data;
  },

  // API 4: Gửi yêu cầu duyệt quyền tạo chuyến/tổ chức chuyến đi cho Admin
  requestHostVerification: async (): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>(
      '/api/users/request-host-verification'
    );
    return res.data;
  },

  // API 5: Admin lấy thông tin chi tiết một người dùng theo ID
  getUserById: async (userId: string): Promise<ApiResponse<AdminUserListItem>> => {
    const res = await axiosClient.get<ApiResponse<AdminUserListItem>>(`/api/users/${userId}`);
    return res.data;
  },

  // API 6: Lấy hồ sơ công khai của Host (Người tổ chức)
  getHostPublicProfile: async (hostId: string): Promise<{
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    rating: number;
    totalCreatedTrips: number;
    completedTripsCount: number;
    uncompletedTripsCount: number;
  }> => {
    const res = await axiosClient.get(`/api/users/${hostId}/public-profile`);
    return res.data;
  },

  getApplicantProfile: async (userId: string) => {
    const res = await axiosClient.get(`/api/users/${userId}/applicant-profile`);
    return res.data;
  },
};
