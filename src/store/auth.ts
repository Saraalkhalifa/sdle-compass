import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      signOut: () => set({ user: null }),
    }),
    {
      name: 'sdle-compass-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

/** Convenience selector: current user role */
export const useRole = () => useAuthStore((s) => s.user?.role ?? 'student');

/** True when authenticated */
export const useIsAuthenticated = () => useAuthStore((s) => Boolean(s.user));
