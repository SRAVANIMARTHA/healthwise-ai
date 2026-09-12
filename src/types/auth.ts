import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Profile } from './database';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: 'user' | 'admin';
  preferredLanguage: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  preferredLanguage?: string;
}
