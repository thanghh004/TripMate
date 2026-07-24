import { axiosClient } from './axiosClient';
import type {
  Country,
  City,
  CreateCountryRequest,
  UpdateCountryRequest,
  CreateCityRequest,
  UpdateCityRequest,
} from '../types/location';

export const locationApi = {
  // ─── QUỐC GIA (COUNTRIES) ───
  getCountries: async (isActive?: boolean): Promise<Country[]> => {
    const params = isActive !== undefined ? { isActive } : {};
    const res = await axiosClient.get<Country[]>('/api/countries', { params });
    return res.data;
  },

  getCountryById: async (id: string): Promise<Country> => {
    const res = await axiosClient.get<Country>(`/api/countries/${id}`);
    return res.data;
  },

  createCountry: async (data: CreateCountryRequest): Promise<Country> => {
    const res = await axiosClient.post<Country>('/api/countries', data);
    return res.data;
  },

  updateCountry: async (id: string, data: UpdateCountryRequest): Promise<Country> => {
    const res = await axiosClient.put<Country>(`/api/countries/${id}`, data);
    return res.data;
  },

  deleteCountry: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/countries/${id}`);
  },

  // ─── THÀNH PHỐ / TỈNH (CITIES) ───
  getCities: async (countryId?: string, isActive?: boolean): Promise<City[]> => {
    const params: Record<string, unknown> = {};
    if (countryId) params.countryId = countryId;
    if (isActive !== undefined) params.isActive = isActive;

    const res = await axiosClient.get<City[]>('/api/cities', { params });
    return res.data;
  },

  getCityById: async (id: string): Promise<City> => {
    const res = await axiosClient.get<City>(`/api/cities/${id}`);
    return res.data;
  },

  createCity: async (data: CreateCityRequest): Promise<City> => {
    const res = await axiosClient.post<City>('/api/cities', data);
    return res.data;
  },

  updateCity: async (id: string, data: UpdateCityRequest): Promise<City> => {
    const res = await axiosClient.put<City>(`/api/cities/${id}`, data);
    return res.data;
  },

  deleteCity: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/cities/${id}`);
  },
};
