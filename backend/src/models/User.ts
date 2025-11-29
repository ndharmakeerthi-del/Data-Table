


import mongoose, { Schema, Document } from "mongoose";
import { required } from "zod/mini";

export interface IUser extends Document {
    id: number
    firstName: string
    lastName: string
    gender: string
    email: string 
    birthDate: string
    profileImage?: string
}

const userSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birthDate: { type: String, required: true },
    profileImage: { type: String, required: false },
});

export default mongoose.model<IUser>('User', userSchema);