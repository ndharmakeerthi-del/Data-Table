import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authAPI, LoginResponse, RegisterResponse } from '@/apis/auth';
import { LoginFormData, RegisterFormData } from '@/schemas';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const useLogin = () => {
    const navigate = useNavigate();
    const { setAdmin, setError, setLoading } = useAuthStore();

    return useMutation<LoginResponse, Error, LoginFormData>({
        mutationFn: authAPI.login,
        onMutate: () => {
            setLoading(true);
            setError(null);
        },
        onSuccess: (data) => {
            if (data.success) {
                setAdmin(data.admin);
                toast.success('Login successful!', {
                    description: `Welcome back, ${data.admin.firstName}!`,
                    position: 'top-center',
                    duration: 3000,
                });
                // Navigate to dashboard after successful login
                navigate('/dashboard', { replace: true });
            } else {
                setError(data.message);
                toast.error('Login failed', {
                    description: data.message,
                    position: 'top-center',
                    duration: 4000,
                });
            }
            setLoading(false);
        },
        onError: (error) => {
            const errorMessage = error.message || 'An unexpected error occurred';
            setError(errorMessage);
            toast.error('Login failed', {
                description: errorMessage,
                position: 'top-center',
                duration: 4000,
            });
            setLoading(false);
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();
    const { setAdmin, setError, setLoading } = useAuthStore();

    return useMutation<RegisterResponse, Error, RegisterFormData>({
        mutationFn: authAPI.register,
        onMutate: () => {
            setLoading(true);
            setError(null);
        },
        onSuccess: (data) => {
            if (data.success) {
                setAdmin(data.admin);
                toast.success('Registration successful!', {
                    description: `Welcome, ${data.admin.firstName}! You are now logged in.`,
                    position: 'top-center',
                    duration: 3000,
                });
                // Navigate to dashboard after successful registration
                navigate('/dashboard', { replace: true });
            } else {
                setError(data.message);
                toast.error('Registration failed', {
                    description: data.message,
                    position: 'top-center',
                    duration: 4000,
                });
            }
            setLoading(false);
        },
        onError: (error) => {
            const errorMessage = error.message || 'An unexpected error occurred';
            setError(errorMessage);
            toast.error('Registration failed', {
                description: errorMessage,
                position: 'top-center',
                duration: 4000,
            });
            setLoading(false);
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const { clearAuth } = useAuthStore();

    return useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            clearAuth();
            navigate('/', { replace: true });
            toast.success('Logged out successfully', {
                position: 'top-center',
                duration: 3000,
            });
        },
        onError: () => {
            // Even if logout fails on server, clear local auth
            clearAuth();
            navigate('/', { replace: true });
            toast.info('Logged out locally', {
                position: 'top-center',
                duration: 3000,
            });
        },
    });
};

// Hook to verify token on app startup/refresh
export const useTokenVerification = () => {
    const navigate = useNavigate();
    const { isAuthenticated, clearAuth, setAdmin } = useAuthStore();

    const query = useQuery({
        queryKey: ['verify-token'],
        queryFn: authAPI.verify,
        enabled: isAuthenticated, // Only run if user thinks they're authenticated
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0, // Always check on mount
    });

    // Handle success/error with useEffect
    useEffect(() => {
        if (query.data) {
            if (query.data.success && query.data.admin) {
                // Token is valid, update admin data
                setAdmin(query.data.admin);
            } else {
                // Token is invalid, logout
                clearAuth();
                navigate('/login', { replace: true });
            }
        }

        if (query.error) {
            console.log('Token verification failed:', query.error);
            // Token is invalid or missing, logout
            clearAuth();
            navigate('/login', { replace: true });
            toast.info('Session expired, please login again', {
                position: 'top-center',
                duration: 4000,
            });
        }
    }, [query.data, query.error, navigate, clearAuth, setAdmin]);

    return query;
};

// Hook to check token validity on page refresh/startup
export const useAuthInitialization = () => {
    const { isAuthenticated, clearAuth, setAdmin } = useAuthStore();

    useEffect(() => {
        const checkTokenOnStartup = async () => {
            if (isAuthenticated) {
                try {
                    const response = await authAPI.verify();
                    if (response.success && response.admin) {
                        setAdmin(response.admin);
                    } else {
                        clearAuth();
                    }
                } catch (error) {
                    console.log('Token verification failed on startup:', error);
                    clearAuth();
                }
            }
        };

        checkTokenOnStartup();
    }, [isAuthenticated, clearAuth, setAdmin]);
};
