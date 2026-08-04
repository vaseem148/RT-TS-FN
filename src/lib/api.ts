import axios, { AxiosError } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY = 'renderways_token';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; details?: Record<string, string> }>) => {
    // A rejected token means the session is gone — clear it so the UI can
    // fall back to the signed-out state instead of looping on 401s.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiErrorShape {
  message: string;
  details?: Record<string, string>;
  status?: number;
}

/** Normalises anything thrown by axios into a predictable shape for the UI. */
export function toApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: Record<string, string> } | undefined;
    if (error.code === 'ERR_NETWORK') {
      return {
        message:
          'Cannot reach the Renderways server. Make sure the backend is running on port 5000.',
        status: 0,
      };
    }
    return {
      message: data?.message || error.message || 'Something went wrong',
      details: data?.details,
      status: error.response?.status,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: 'Something went wrong' };
}
