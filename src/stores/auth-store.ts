import { create } from 'zustand';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/auth/auth-service';
import { isSupabaseConfigured } from '../services/database/supabase-client';

interface AuthStoreState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signUp: (credentials: RegisterCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; preferredLanguage?: string }) => Promise<boolean>;
  clearError: () => void;
}

let authSubscriptionStarted = false;

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isConfigured: isSupabaseConfigured,
  isInitialized: false,

  initialize: async () => {
    // Only run initialization once per app lifecycle
    if (get().isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false, isInitialized: true });
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
    }

    // Subscribe to auth state updates only once
    if (!authSubscriptionStarted) {
      authSubscriptionStarted = true;
      authService.onAuthStateChange((user) => {
        set({ user, isLoading: false, isInitialized: true });
      });
    }
  },

  signIn: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    const { user, error } = await authService.signIn(credentials);
    if (error) {
      set({ error, isLoading: false });
      return false;
    }
    set({ user, isLoading: false, isInitialized: true, error: null });
    return true;
  },

  signUp: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    const { user, error } = await authService.signUp(credentials);
    if (error) {
      set({ error, isLoading: false });
      return false;
    }
    set({ user, isLoading: false, isInitialized: true, error: null });
    return true;
  },

  signOut: async () => {
    set({ isLoading: true });
    await authService.signOut();
    set({ user: null, isLoading: false, error: null });
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return false;

    set({ isLoading: true, error: null });
    const { success, error } = await authService.updateProfile(currentUser.id, {
      full_name: updates.fullName,
      preferred_language: updates.preferredLanguage,
    });

    if (error) {
      set({ error, isLoading: false });
      return false;
    }

    set({
      user: {
        ...currentUser,
        fullName: updates.fullName !== undefined ? updates.fullName : currentUser.fullName,
        preferredLanguage: updates.preferredLanguage || currentUser.preferredLanguage,
      },
      isLoading: false,
    });
    return true;
  },

  clearError: () => set({ error: null }),
}));
