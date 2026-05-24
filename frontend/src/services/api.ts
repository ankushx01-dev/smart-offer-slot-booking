import axios from 'axios';
import type {
  Booking,
  Business,
  DashboardSummary,
  LoginResponse,
  Offer,
  Slot,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type OnboardingPayload = {
  name: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  openingTime: string;
  closingTime: string;
  offerTitle: string;
  offerDescription: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  startDate: string;
  endDate: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  capacity: number;
};

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/register', { name, email, password }),
  completeOnboarding: (data: OnboardingPayload) =>
    api.post<LoginResponse>('/api/auth/onboarding', data),
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),
};

export type BusinessProfilePayload = {
  name: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logoUrl?: string;
  openingTime: string;
  closingTime: string;
};

export const businessApi = {
  get: () => api.get<Business>('/api/business'),
  getMine: () => api.get<Business>('/api/business/mine'),
  create: (data: BusinessProfilePayload) => api.post<Business>('/api/business', data),
  upsertMine: (data: BusinessProfilePayload) => api.put<Business>('/api/business/mine', data),
  update: (id: number, data: BusinessProfilePayload | Partial<Business>) =>
    api.put<Business>(`/api/business/${id}`, data),
};

export const offersApi = {
  getPublic: (params?: Record<string, string | number | boolean>) =>
    api.get<Offer[]>('/api/offers', { params }),
  getAdmin: () => api.get<Offer[]>('/api/offers', { params: { admin: true } }),
  getById: (id: number) => api.get<Offer>(`/api/offers/${id}`),
  create: (data: Record<string, unknown>) => api.post<Offer>('/api/offers', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<Offer>(`/api/offers/${id}`, data),
  delete: (id: number) => api.delete(`/api/offers/${id}`),
};

export const slotsApi = {
  getByOffer: (offerId: number) => api.get<Slot[]>(`/api/offers/${offerId}/slots`),
  create: (data: Record<string, unknown>) => api.post<Slot>('/api/slots', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<Slot>(`/api/slots/${id}`, data),
  delete: (id: number) => api.delete(`/api/slots/${id}`),
};

export const bookingsApi = {
  create: (data: Record<string, unknown>) => api.post<Booking>('/api/bookings', data),
  getAll: () => api.get<Booking[]>('/api/bookings'),
  getById: (id: number) => api.get<Booking>(`/api/bookings/${id}`),
  getByReference: (reference: string) =>
    api.get<Booking>(`/api/bookings/reference/${reference}`),
  updateStatus: (id: number, status: string) =>
    api.put<Booking>(`/api/bookings/${id}/status`, { status }),
};

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/api/dashboard/summary'),
};

export default api;
