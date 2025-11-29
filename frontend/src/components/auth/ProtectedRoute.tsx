import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { authAPI } from '@/apis/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, admin, clearAuth, setAdmin } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticated) {
        try {
          const response = await authAPI.verify();
          if (response.success && response.admin) {
            setAdmin(response.admin);
          } else {
            clearAuth();
          }
        } catch (error) {
          console.log('Auth verification failed:', error);
          clearAuth();
        }
      }
      setIsVerifying(false);
    };

    verifyAuth();
  }, [isAuthenticated, clearAuth, setAdmin]);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Show auth container (login/register) if not authenticated
  if (!isAuthenticated || !admin) {
    return <AuthContainer />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}

// Alternative component for redirect-based approach
export function RequireAuth({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}