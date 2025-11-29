import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser, User } from '@/apis/users'
import { toast } from 'sonner'
import { getUsersPaginated } from '@/apis/users'

// Query key factory
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: number) => [...userKeys.details(), id] as const,
}

// Hook to get all users
export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: getUsers,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: 1000,
    })
}

// Hook to get paginated users
export const useUsersPaginated = (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    return useQuery({
        queryKey: ['users', 'paginated', page, limit, search],
        queryFn: () => getUsersPaginated(page, limit, search),
        placeholderData: (previousData) => previousData, // For React Query v5
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        retryDelay: 1000,
    })
}

// Hook to create a new user
export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userData, file }: { userData: Omit<User, 'id'>; file?: File }) => createUser(userData, file),
        onSuccess: (newUser) => {
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['users', 'paginated'] })

            // Optimistically update the cache
            queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
                return old ? [...old, newUser] : [newUser]
            })

            // toast.success('User created successfully!')
        },
        onError: (error: any) => {
            console.error('Create user error:', error)
            // toast.error(`Failed to create user: ${error.response?.data?.message || error.message}`)
        },
    })
}

// Hook to update a user
export const useUpdateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            userData,
            file
        }: {
            id: number;
            userData: Partial<User>;
            file?: File
        }) => updateUser(id, userData, file),
        onSuccess: (updatedUser) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['users', 'paginated'] })

            // Optimistically update the cache
            queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
                return old ? old.map(user => user.id === updatedUser.id ? updatedUser : user) : [updatedUser]
            })

            toast.success('User updated successfully!')
        },
        onError: (error: any) => {
            console.error('Update user error:', error)
            toast.error(`Failed to update user: ${error.response?.data?.message || error.message}`)
        },
    })
}

// Hook to delete a user
export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (_, deletedUserId) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['users', 'paginated'] })

            // Optimistically update the cache
            queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
                return old ? old.filter(user => user.id !== deletedUserId) : []
            })

            toast.success('User deleted successfully!')
        },
        onError: (error: any) => {
            console.error('Delete user error:', error)
            toast.error(`Failed to delete user: ${error.response?.data?.message || error.message}`)
        },
    })
}