import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type { CreateTripRequest, Trip } from '../types/trip';

export const tripApi = {
  // API Tạo chuyến đi mới
  createTrip: async (data: CreateTripRequest): Promise<ApiResponse<Trip>> => {
    const res = await axiosClient.post<ApiResponse<Trip>>('/api/trips', data);
    return res.data;
  },

  // API Cập nhật chuyến đi
  updateTrip: async (id: string, data: Partial<CreateTripRequest>): Promise<ApiResponse<Trip>> => {
    const res = await axiosClient.put<ApiResponse<Trip>>(`/api/trips/${id}`, data);
    return res.data;
  },

  // API Hủy chuyến đi
  cancelTrip: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosClient.patch<ApiResponse<{ message: string }>>(`/api/trips/${id}/cancel`);
    return res.data;
  },

  // API Lấy chuyến đi của tôi
  getMyTrips: async (): Promise<ApiResponse<Trip[]>> => {
    const res = await axiosClient.get<ApiResponse<Trip[]>>('/api/trips/my-trips');
    return res.data;
  },
};
