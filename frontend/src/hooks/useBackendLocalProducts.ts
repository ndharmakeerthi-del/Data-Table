import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLocalProducts, createLocalProduct, LocalProduct, updateLocalProduct, deleteLocalProduct } from "@/apis/localProducts"
import { getProductsPaginated } from "@/apis/localProducts"
import { toast } from "sonner"







export const productKeys = {
    all: ["local-products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (filters: Record<string, any>) => [...productKeys.all, { filters }] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
}

// Hook to get all local products
export const useLocalProducts = () => {
    return useQuery({
        queryKey: productKeys.lists(),
        queryFn: getLocalProducts,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: 1000,
    })
}

// Hook to get paginated local products
export const useLocalProductsPaginated = (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    return useQuery({
        queryKey: ["local-products", "paginated", page, limit, search],
        queryFn: () => getProductsPaginated(page, limit, search),
        placeholderData: (previousData) => previousData, // For React Query v5
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        retryDelay: 1000,
    })
}

// Hook to create a new local product
export const useCreateLocalProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLocalProduct,
        onSuccess: (newProduct) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            
            queryClient.setQueryData<LocalProduct[]>(productKeys.lists(), (old) => {
                return old ? [...old, newProduct] : [newProduct];
            })
            toast.success('Local product created successfully!');
        },
        onError: (error: any) => {
            console.error('Create local product error:', error);
            toast.error(`Failed to create local product: ${error.response?.data?.message || error.message}`);
        },
    })
}

// Hook to update a local product
export const useUpdateLocalProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updatedData }: { id: number; updatedData: Partial<LocalProduct> }) => updateLocalProduct(id, updatedData),
        onSuccess: (updateLocalProduct) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });

            queryClient.setQueryData<LocalProduct[]>(productKeys.lists(), (old) => {
                return old ? old.map(product => product.id === updateLocalProduct.id ? updateLocalProduct : product) : [updateLocalProduct];
            })

            toast.success('Local product updated successfully!');
        },
        onError: (error: any) => {
            console.error('Update local product error:', error);
            toast.error(`Failed to update local product: ${error.response?.data?.message || error.message}`);
        }
    })
}

// Hook to delete a local product
export const useDeleteLocalProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLocalProduct,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });

            queryClient.setQueryData<LocalProduct[]>(productKeys.lists(), (old) =>{
                return old ? old.filter(product => product.id !== id) : [];
            })

            toast.success('Local product deleted successfully!');
        },
        onError: (error: any) => {
            console.error('Delete local product error:', error);
            toast.error(`Failed to delete local product: ${error.response?.data?.message || error.message}`);
        }
    })
}