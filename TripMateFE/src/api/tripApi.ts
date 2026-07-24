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
  cancelTrip: async (id: string): Promise<{ message: string }> => {
    const res = await axiosClient.patch<{ message: string }>(`/api/trips/${id}/cancel`);
    return res.data;
  },

  // API Lấy chuyến đi của tôi
  getMyTrips: async (): Promise<Trip[]> => {
    const res = await axiosClient.get<Trip[]>('/api/trips/my-trips');
    return res.data;
  },
};
