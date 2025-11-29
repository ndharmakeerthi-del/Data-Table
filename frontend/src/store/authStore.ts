import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Admin {
    _id: string;
    id: number;
    firstName?: string;
    lastName?: string;
    gender: string;
    username: string;
    role: 'admin' | 'user';
}

interface AuthState {
    admin: Admin | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    setAdmin: (admin: Admin) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // State
            admin: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            setAdmin: (admin) =>
                set(() => ({
                    admin,
                    isAuthenticated: true,
                    error: null,
                })),

            clearAuth: () =>
                set(() => ({
                    admin: null,
                    isAuthenticated: false,
                    error: null,
                })),

            setLoading: (loading) =>
                set(() => ({
                    isLoading: loading,
                })),

            setError: (error) =>
                set(() => ({
                    error,
                })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                admin: state.admin,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);