


import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import e from "express";

export interface IAdmin extends Document {
    id: number
    firstName: string
    lastName: string
    gender: string
    username: string
    password: string
    role: 'admin' | 'user'
    comparePassword(candidatePassword: string): Promise<boolean>
}

const adminSchema: Schema = new Schema<IAdmin>({
    id: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true }
}, {timestamps: true});

// Hash password before save
adminSchema.pre<IAdmin>("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// Compare password method
adminSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);