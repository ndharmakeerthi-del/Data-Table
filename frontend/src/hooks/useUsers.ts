import { getUsersPaginated } from "@/apis/users";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// src/hooks/useUsers.ts
export const useUsersPaginated = (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    return useQuery({
        queryKey: ['users', 'paginated', page, limit, search],
        queryFn: () => getUsersPaginated(page, limit, search),
        placeholderData: keepPreviousData, // Important for smooth pagination
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};