

// import axios from "axios"
// import { env } from "@/config/env"
import { usersApi } from "./client";

// API client for backend  
// const backendApi = axios.create({
//     baseURL: env.BACKEND_API_BASE_URL || "http://localhost:3000/api",
//     timeout: env.API_TIMEOUT,
//     headers: {
//         "Content-Type": "application/json",
//     }
// })

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    gender: "Male" | "Female";
    email: string;
    birthDate: string;
    profileImage?: string;
    // _id?: string; // MongoDB ID
    // __v?: number; // MongoDB version
}


export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}


// Create FormData for multipart requests
const createUserFormData = (userData: any, file?: File): FormData => {
    const formData = new FormData();

    // Add user data
    Object.keys(userData).forEach(key => {
        if(userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key]);
        }
    });

    // Add file if provided
    if (file) {
        formData.append('profileImage', file);
    }

    return formData;
}

export const getUsersPaginated = async (
    page: number = 1,
    limit: number = 10,
    search?: string
): Promise<PaginationResponse<User>> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });

        console.log('Fetching users with params:', { page, limit, search });
        const response = await usersApi.get(`/users?${params}`);
        console.log('Users API response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated users:', error);
        throw error;
    }
};

// Get all users
export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await usersApi.get('/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Get user by ID
export const getUserById = async (id: number): Promise<User> => {
    try {
        const response = await usersApi.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Create new user
export const createUser = async (userData: Omit<User, "id">, file?: File): Promise<User> => {
    try {
        const formData = createUserFormData(userData, file);

        const response = await usersApi.post('/users', formData, { //userApi or backendApi
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data || response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Update user
export const updateUser = async (id: number, userData: Partial<Omit<User, "id">>, file?: File): Promise<User> => {
    try {
        const formData = createUserFormData(userData, file);

        const response = await usersApi.put(`/users/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data || response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
    try {
        await usersApi.delete(`/users/${id}`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Delete user profile image only 
export const deleteUserProfileImage = async (id: number) : Promise<User> => {
    try {
        const response = await usersApi.delete(`users/${id}/profile-image`);
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error deleting user profile image: ', error);
        throw error;
    }
}