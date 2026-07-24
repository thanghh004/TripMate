import { axiosClient } from './axiosClient';
import type {
  TripCategory,
  CreateTripCategoryRequest,
  UpdateTripCategoryRequest,
} from '../types/tripCategory';

export const tripCategoryApi = {
  // Lấy danh sách loại chuyến đi
  getCategories: async (isActive?: boolean): Promise<TripCategory[]> => {
    const params = isActive !== undefined ? { isActive } : {};
    const res = await axiosClient.get<TripCategory[]>('/api/categories', { params });
    return res.data;
  },

  // Tạo mới loại chuyến đi
  createCategory: async (data: CreateTripCategoryRequest): Promise<TripCategory> => {
    const res = await axiosClient.post<TripCategory>('/api/categories', data);
    return res.data;
  },

  // Cập nhật loại chuyến đi
  updateCategory: async (id: string, data: UpdateTripCategoryRequest): Promise<TripCategory> => {
    const res = await axiosClient.put<TripCategory>(`/api/categories/${id}`, data);
    return res.data;
  },

  // Xóa mềm loại chuyến đi
  deleteCategory: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/categories/${id}`);
  },
};
