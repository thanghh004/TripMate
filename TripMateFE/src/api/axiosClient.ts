import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import type { ApiResponse, AuthResponse } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1301';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Bearer Token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag để ngăn lặp vô tận khi Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Tự động phát hiện tài khoản bị khóa hoặc silent refresh token khi HTTP 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.message || '';
      // Nếu là lỗi tài khoản bị khóa -> Đăng xuất ngay lập tức và đưa người dùng về trang login
      if (errorMessage.toLowerCase().includes('khóa') || errorMessage.toLowerCase().includes('suspended')) {
        storage.clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const accessToken = storage.getAccessToken();
        const refreshToken = storage.getRefreshToken();

        if (!accessToken || !refreshToken) {
          storage.clearAuth();
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
            `${BASE_URL}/api/auth/refresh-token`,
            { accessToken, refreshToken }
          );

          if (refreshResponse.data && refreshResponse.data.data) {
            const newAuth = refreshResponse.data.data;
            storage.setAccessToken(newAuth.accessToken);
            storage.setRefreshToken(newAuth.refreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAuth.accessToken}`;
            }

            processQueue(null, newAuth.accessToken);
            return axiosClient(originalRequest);
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          storage.clearAuth();
          window.location.reload();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);
