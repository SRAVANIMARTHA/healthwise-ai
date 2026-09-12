import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../../types/auth';
import { Profile } from '../../types/database';

const LOCAL_STORAGE_KEY = 'healthwise_demo_user';

export const authService = {
  /**
   * Register a new user with Supabase Auth
   */
  async signUp(credentials: RegisterCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      // Offline/Demo mode fallback
      const demoUser: AuthUser = {
        id: 'demo-user-' + Date.now(),
        email: credentials.email,
        fullName: credentials.fullName,
        role: credentials.email.includes('admin') ? 'admin' : 'user',
        preferredLanguage: credentials.preferredLanguage || 'en',
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser));
      return { user: demoUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            preferred_language: credentials.preferredLanguage || 'en',
            role: 'user',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Registration failed. No user record returned.' };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || credentials.email,
        fullName: credentials.fullName,
        role: 'user',
        preferredLanguage: credentials.preferredLanguage || 'en',
      };

      return { user: authUser, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'An unexpected error occurred during signup.' };
    }
  },

  /**
   * Sign in an existing user with Supabase Auth
   */
  async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      // Offline/Demo mode fallback: authenticate with the provided credentials
      const normalizedEmail = credentials.email.trim().toLowerCase();
      const demoUser: AuthUser = {
        id: 'demo-user-' + normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0],
        role: normalizedEmail.includes('admin') ? 'admin' : 'user',
        preferredLanguage: 'en',
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser));
      return { user: demoUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Login failed. No user found.' };
      }

      // Fetch user profile safely
      const profile = await this.getProfile(data.user.id);

      // Determine role: profile role > app_metadata role > user_metadata role > fallback 'user'
      const resolvedRole: 'user' | 'admin' =
        (profile?.role === 'admin' ||
         data.user.app_metadata?.role === 'admin' ||
         data.user.user_metadata?.role === 'admin')
          ? 'admin'
          : 'user';

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || credentials.email,
        fullName: profile?.full_name || (data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? null),
        role: resolvedRole,
        preferredLanguage: profile?.preferred_language || (data.user.user_metadata?.preferred_language ?? 'en'),
      };

      // Cache session for resilience & instant restore on refresh
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));

      return { user: authUser, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'An unexpected error occurred during sign in.' };
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || 'Error signing out.' };
    }
  },

  /**
   * Get current authenticated user session
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      }

      const profile = await this.getProfile(session.user.id);

      const resolvedRole: 'user' | 'admin' =
        (profile?.role === 'admin' ||
         session.user.app_metadata?.role === 'admin' ||
         session.user.user_metadata?.role === 'admin')
          ? 'admin'
          : 'user';

      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        fullName: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
        role: resolvedRole,
        preferredLanguage: profile?.preferred_language || session.user.user_metadata?.preferred_language || 'en',
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
      return authUser;
    } catch {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  },

  /**
   * Retrieve user profile from public.profiles table
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data as Profile;
    } catch {
      return null;
    }
  },

  /**
   * Update user profile in public.profiles table
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const user: AuthUser = JSON.parse(stored);
        if (updates.full_name !== undefined) user.fullName = updates.full_name;
        if (updates.preferred_language !== undefined) user.preferredLanguage = updates.preferred_language;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      }
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error updating profile.' };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id);
        const resolvedRole: 'user' | 'admin' =
          (profile?.role === 'admin' ||
           session.user.app_metadata?.role === 'admin' ||
           session.user.user_metadata?.role === 'admin')
            ? 'admin'
            : 'user';

        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
          role: resolvedRole,
          preferredLanguage: profile?.preferred_language || session.user.user_metadata?.preferred_language || 'en',
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
        callback(authUser);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        callback(null);
      }
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  },
};
