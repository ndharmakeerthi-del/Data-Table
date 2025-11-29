
import productsApi from "./client"


// API client for backend
// const backendApi = axios.create({
//     baseURL: env.BACKEND_API_BASE_URL || "http://localhost:3000/api",
//     timeout: env.API_TIMEOUT,
//     headers: {
//         "Content-Type": "application/json",
//     }
// })



export interface Product {
    id: number;
    title: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
}


export const fetchProducts = async (): Promise<Product[]> => {
    const response = await productsApi.get("/products");
    return response.data.products.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        discountPercentage: item.discountPercentage,
        rating: item.rating,
        stock: item.stock,
        brand: item.brand,
    }));
};

