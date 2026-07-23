import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/auth';

export interface CreateTripDto {
  title: string;
  description?: string;
}

export interface CreateTripResponseDto {
  tripId: string;
  title: string;
  message: string;
}

export const tripApi = {
  // API Tạo chuyến đi mới (Thực thi kiểm tra phân quyền Host 100% tại Backend)
  createTrip: async (data: CreateTripDto): Promise<ApiResponse<CreateTripResponseDto>> => {
    const res = await axiosClient.post<ApiResponse<CreateTripResponseDto>>('/api/trips', data);
    return res.data;
  },
};
