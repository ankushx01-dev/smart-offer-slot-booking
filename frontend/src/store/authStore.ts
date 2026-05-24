import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  name: string | null;
  email: string | null;
  businessType: string | null;
  businessName: string | null;
  setAuth: (
    token: string,
    name: string,
    email: string,
    businessType?: string,
    businessName?: string
  ) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      name: null,
      email: null,
      businessType: null,
      businessName: null,
      setAuth: (token, name, email, businessType, businessName) => {
        localStorage.setItem('token', token);
        set({ token, name, email, businessType: businessType ?? null, businessName: businessName ?? null });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          name: null,
          email: null,
          businessType: null,
          businessName: null,
        });
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-storage' }
  )
);
