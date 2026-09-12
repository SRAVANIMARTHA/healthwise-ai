import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export const useAuth = () => {
  const {
    user,
    isLoading,
    error,
    isConfigured,
    isInitialized,
    initialize,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isLoading,
    error,
    isConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
  };
};
