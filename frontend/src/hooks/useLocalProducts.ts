// // src/hooks/useLocalProducts.ts
// import { useQuery } from "@tanstack/react-query";
// import { fetchLocalProduct, LocalProduct } from "@/apis/localProducts";

// export const localProductKeys = {
//   all: ["local-products"] as const,
//   lists: () => [...localProductKeys.all, "list"] as const,
//   list: (filters: Record<string, unknown>) =>
//     [...localProductKeys.lists(), { filters }] as const,
//   details: () => [...localProductKeys.all, "detail"] as const,
//   detail: (id: string) => [...localProductKeys.details(), id] as const,
// };

// export const useLocalProducts = (filters: Record<string, unknown> = {}) => {
//   return useQuery<LocalProduct[]>({
//     queryKey: localProductKeys.list(filters),
//     queryFn: fetchLocalProduct,
//     // staleTime/retry can be kept here or via QueryClient defaults
//   });
// };

import {getProductsPaginated}  from "@/apis/localProducts";
import { useQuery, keepPreviousData } from "@tanstack/react-query";


export const useLocalProductsPaginated = (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    return useQuery({
        queryKey: ['local-products', 'paginated', page, limit, search],
        queryFn: () => getProductsPaginated(page, limit, search),
        placeholderData: keepPreviousData, // Important for smooth pagination
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: 1000,
    });
};