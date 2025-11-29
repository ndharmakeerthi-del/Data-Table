import axios from "axios"
import { env } from "@/config/env"

const productsApi = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: env.API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    }
})


// const usersApi = axios.create({
//     baseURL: env.API_BASE_URL,
//     timeout: env.API_TIMEOUT,
//     headers: {
//         "Content-Type": "application/json",
//     }
// })

const usersApi = axios.create({
    baseURL: env.BACKEND_API_BASE_URL,
    timeout: env.API_TIMEOUT,
    withCredentials: true, // Include cookies in requests
    headers: {
        "Content-Type": "application/json",
    }
})

const localProductsApi = axios.create({
    baseURL: env.BACKEND_API_BASE_URL,
    timeout: env.API_TIMEOUT,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

export { usersApi, localProductsApi };

export default productsApi;