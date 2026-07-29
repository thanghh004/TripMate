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

  // API Lấy chuyến đi của tôi
  getMyTrips: async (): Promise<Trip[]> => {
    const res = await axiosClient.get<Trip[]>('/api/trips/my-trips');
    return res.data;
  },
};
