import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  timezone: string;
  workHours: { start: string; end: string; days: number[] };
  productivityPreferences: {
    peakHours: string[];
    preferredFocusDuration: number;
    breakDuration: number;
    deepWorkBlocks: number;
  };
  focusPreferences: {
    protectMornings: boolean;
    protectAfternoons: boolean;
    minFocusBlock: number;
    maxMeetingsPerDay: number;
  };
  aiSettings: {
    autoSchedule: boolean;
    autoReschedule: boolean;
    learningEnabled: boolean;
    suggestionFrequency: string;
  };
  notificationSettings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    reminderMinutes: number[];
    deadlineAlerts: boolean;
    aiSuggestions: boolean;
  };
  onboardingCompleted: boolean;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data.data;
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { user, tokens } = response.data.data;
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // ignore
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      // Called once on app startup to restore session after rehydration
      initialize: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isInitialized: true, isAuthenticated: false, user: null });
          return;
        }
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true, isInitialized: true });
        } catch {
          // Token invalid/expired — try refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const { default: axios } = await import('axios');
              const API_URL = import.meta.env.VITE_API_URL || '/api';
              const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
              const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
              localStorage.setItem('accessToken', newAccess);
              localStorage.setItem('refreshToken', newRefresh);
              const meRes = await api.get('/auth/me');
              set({
                user: meRes.data.data,
                accessToken: newAccess,
                refreshToken: newRefresh,
                isAuthenticated: true,
                isInitialized: true,
              });
              return;
            } catch {
              // Refresh also failed — clear everything
            }
          }
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, isInitialized: true });
        }
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
