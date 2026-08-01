import { axiosClient } from './axiosClient';
import type { CreateTripRequest, Trip } from '../types/trip';

export const tripApi = {
  // API Tạo chuyến đi mới
  createTrip: async (data: CreateTripRequest): Promise<Trip> => {
    const res = await axiosClient.post<Trip>('/api/trips', data);
    return res.data;
  },

  // API Cập nhật chuyến đi
  updateTrip: async (id: string, data: Partial<CreateTripRequest>): Promise<Trip> => {
    const res = await axiosClient.put<Trip>(`/api/trips/${id}`, data);
    return res.data;
  },

  // API Hủy chuyến đi
  cancelTrip: async (id: string, reason?: string): Promise<{ message: string }> => {
    const res = await axiosClient.patch<{ message: string }>(`/api/trips/${id}/cancel`, { reason });
    return res.data;
  },

  // API Lấy chi tiết 1 chuyến đi theo ID
  getTripById: async (id: string): Promise<Trip> => {
    const res = await axiosClient.get<Trip>(`/api/trips/${id}`);
    return res.data;
  },

  // API Đăng ký tham gia chuyến đi
  joinTrip: async (tripId: string): Promise<{ message: string }> => {
    const res = await axiosClient.post<{ message: string }>(`/api/trips/${tripId}/join`);
    return res.data;
  },

  approveMember: async (tripId: string, memberUserId: string): Promise<{ message: string }> => {
    const res = await axiosClient.post<{ message: string }>(`/api/trips/${tripId}/members/${memberUserId}/approve`);
    return res.data;
  },

  rejectMember: async (tripId: string, memberUserId: string): Promise<{ message: string }> => {
    const res = await axiosClient.post<{ message: string }>(`/api/trips/${tripId}/members/${memberUserId}/reject`);
    return res.data;
  },

  // API Lấy chuyến đi của tôi
  getMyTrips: async (): Promise<Trip[]> => {
    const res = await axiosClient.get<Trip[]>('/api/trips/my-trips');
    return res.data;
  },

  // API Lấy danh sách chuyến đi công khai đã duyệt (Open, Full) cho Trang chủ & Khám phá
  getPublicTrips: async (): Promise<Trip[]> => {
    const res = await axiosClient.get<Trip[]>('/api/trips/public');
    return res.data;
  },

  // API Lấy danh sách các chuyến đi mà người dùng hiện tại đã đăng ký tham gia
  getJoinedTrips: async (): Promise<Trip[]> => {
    const res = await axiosClient.get<Trip[]>('/api/trips/joined');
    return res.data;
  },

  // API Thành viên tự hủy đăng ký tham gia chuyến đi
  cancelRegistration: async (tripId: string, reason: string): Promise<{ message: string }> => {
    const res = await axiosClient.post<{ message: string }>(`/api/trips/${tripId}/cancel-registration`, { reason });
    return res.data;
  },
};
