import { usersApi } from './client';
import { LoginFormData, RegisterFormData } from '@/schemas';

export interface LoginResponse {
    success: boolean;
    message: string;
    admin: {
        _id: string;
        id: number;
        firstName: string;
        lastName: string;
        gender: string;
        username: string;
        role: 'admin' | 'user';
    };
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    user: {  // Changed from 'admin' to 'user' to match backend response
        _id: string;
        id: number;
        firstName: string;
        lastName: string;
        gender: string;
        username: string;
        role: 'admin' | 'user';
    };
    emailSent: boolean;
}

export interface LoginRequest {
    username: string;
    password: string;
}

// Auth API functions
export const authAPI = {
    // Login
    login: async (credentials: LoginFormData): Promise<LoginResponse> => {
        const response = await usersApi.post('/auth/login', credentials);
        return response.data;
    },

    // Register - FIX: Change from '/auth/register' to '/register'
    register: async (data: RegisterFormData): Promise<RegisterResponse> => {
        const response = await usersApi.post('/register', data);
        return response.data;
    },

    // Logout
    logout: async (): Promise<{ success: boolean; message: string }> => {
        const response = await usersApi.post('/auth/logout');
        return response.data;
    },

    // Verify token
    verify: async (): Promise<{ success: boolean; message: string; admin: LoginResponse['admin'] }> => {
        const response = await usersApi.get('/auth/verify');
        return response.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<LoginResponse['admin']> => {
        const response = await usersApi.get('/auth/me');
        return response.data.admin;
    },
};