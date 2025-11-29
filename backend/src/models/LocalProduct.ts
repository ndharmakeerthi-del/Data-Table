




import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
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


const productSchema = new Schema<IProduct>({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    rating: { type: Number, required: true },
    stock: { type: Number, required: true },
    brand: { type: String, required: true },
    image: { type: String, required: false },
})

const LocalProduct = mongoose.model<IProduct>("LocalProduct", productSchema)

export default LocalProduct