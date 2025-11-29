import { localProductsApi } from "./client";
// import productsApi from "./client"

export interface LocalProduct {
    id: number;
    title: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    image?: string;
}

// export interface Pagi

// export const fetchLocalProduct = async (): Promise<LocalProduct[]> => {
//     const response = await localProductsApi.get("/products");

//     // Some APIs return `{ products: [...] }`
//     if (Array.isArray(response.data?.products)) {
//         return response.data.products.map((item: any) => ({
//             id: item.id,
//             title: item.title,
//             category: item.category,
//             price: item.price,
//             discountPercentage: item.discountPercentage,
//             rating: item.rating,
//             stock: item.stock,
//             brand: item.brand,
//         }));
//     }

//     // Some APIs return the array directly: `[...]`
//     if (Array.isArray(response.data)) {
//         return response.data.map((item: any) => ({
//             id: item.id,
//             title: item.title,
//             category: item.category,
//             price: item.price,
//             discountPercentage: item.discountPercentage,
//             rating: item.rating,
//             stock: item.stock,
//             brand: item.brand,
//         }));
//     }

//     // If nothing matches, throw a clear error
//     throw new Error("Unexpected local products response shape");
// };

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const getProductsPaginated = async (
    page: number = 1,
    limit: number = 10,
    search?: string
) : Promise<PaginationResponse<LocalProduct>> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });

        console.log('Fetching products with params:', { page, limit, search });
        const response = await localProductsApi.get(`/local-products?${params}`);
        console.log('Products API response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated products:', error);
        throw error;
    }
}

// Get all products
export const getLocalProducts = async (): Promise<LocalProduct[]> => {
    try {
        const response = await localProductsApi.get('/local-products');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Get product by ID
export const getLocalProductById = async (id: number): Promise<LocalProduct> => {
    try {
        const response = await localProductsApi.get(`/local-products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

// Create a new local product
export const createLocalProduct = async (productData: Omit<LocalProduct, 'id' | '_id' | '__v'>): Promise<LocalProduct> => {
    try {
        const response = await localProductsApi.post('/local-products', productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

// Update a local product
export const updateLocalProduct = async (id: number, updatedData: Partial<Omit<LocalProduct, 'id' | '_id' | '__v'>>): Promise<LocalProduct> => {
    try {
        const response = await localProductsApi.put(`/local-products/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Delete a local product
export const deleteLocalProduct = async (id: number): Promise<void> => {
    try {
        await localProductsApi.delete(`/local-products/${id}`);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}