import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type { AdminUserListItem, AdminUpdateUserRequest } from '../types/admin';
import type { PendingHostVerification } from '../types/adminHost';

export interface AdminStatsResponse {
  totalUsers: number;
  totalOrganizers: number;
  totalTrips: number;
  pendingVerifications: number;
}

export const adminApi = {
  // 1. Lấy chỉ số thống kê tổng quan cho Dashboard
  getStats: async (): Promise<ApiResponse<AdminStatsResponse>> => {
    const res = await axiosClient.get<ApiResponse<AdminStatsResponse>>('/api/admin/stats');
    return res.data;
  },

  // 2. Lấy danh sách yêu cầu duyệt CCCD / tạo chuyến (Host Verification Requests)
  getPendingVerifications: async (): Promise<ApiResponse<PendingHostVerification[]>> => {
    const res = await axiosClient.get<ApiResponse<PendingHostVerification[]>>('/api/admin/host-verifications/pending');
    return res.data;
  },

  // 3. Phê duyệt yêu cầu tạo chuyến của người dùng
  approveHostVerification: async (userId: string): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>(`/api/admin/host-verifications/${userId}/approve`);
    return res.data;
  },

  // 4. Từ chối yêu cầu tạo chuyến của người dùng (có thể kèm lý do)
  rejectHostVerification: async (userId: string, reason?: string): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>(`/api/admin/host-verifications/${userId}/reject`, { reason });
    return res.data;
  },

  // 5. Lấy danh sách tất cả người dùng trong hệ thống
  getUsers: async (): Promise<ApiResponse<AdminUserListItem[]>> => {
    const res = await axiosClient.get<ApiResponse<AdminUserListItem[]>>('/api/admin/users');
    return res.data;
  },

  // 6. Khóa hoặc Mở khóa tài khoản người dùng
  toggleUserStatus: async (userId: string): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.post<ApiResponse<{ isSuccess: boolean }>>(`/api/admin/users/${userId}/toggle-status`);
    return res.data;
  },

  // 7. Admin cập nhật cài đặt quản trị của người dùng
  updateUser: async (
    userId: string,
    data: AdminUpdateUserRequest
  ): Promise<ApiResponse<{ isSuccess: boolean }>> => {
    const res = await axiosClient.put<ApiResponse<{ isSuccess: boolean }>>(`/api/admin/users/${userId}`, data);
    return res.data;
  },
};
