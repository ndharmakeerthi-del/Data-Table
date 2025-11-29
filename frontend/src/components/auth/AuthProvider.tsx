import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/apis/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, clearAuth, setAdmin } = useAuthStore();

  useEffect(() => {
    const verifyTokenOnStartup = async () => {
      // Only verify if the user thinks they're authenticated
      if (isAuthenticated) {
        try {
          const response = await authAPI.verify();
          if (response.success && response.admin) {
            // Token is valid, ensure admin data is up to date
            setAdmin(response.admin);
          } else {
            // Token is invalid, clear auth state
            console.log('Token verification failed: Invalid token');
            clearAuth();
          }
        } catch (error) {
          // Token is missing or expired, clear auth state
          console.log('Token verification failed:', error);
          clearAuth();
        }
      }
    };

    verifyTokenOnStartup();
  }, []); // Only run on mount

  // Also check token when localStorage changes (e.g., user deletes it manually)
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'auth-storage' && e.newValue === null) {
        // Auth data was removed from localStorage
        clearAuth();
      } else if (e.key === 'auth-storage' && isAuthenticated) {
        // Auth data changed, verify token is still valid
        try {
          const response = await authAPI.verify();
          if (!response.success || !response.admin) {
            clearAuth();
          }
        } catch (error) {
          clearAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, clearAuth]);

  // Periodic token verification (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const response = await authAPI.verify();
        if (!response.success || !response.admin) {
          clearAuth();
        }
      } catch (error) {
        console.log('Periodic token check failed:', error);
        clearAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, clearAuth]);

  return <>{children}</>;
}