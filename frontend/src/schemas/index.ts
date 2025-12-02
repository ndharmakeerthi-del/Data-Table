import * as z from "zod";

export const AddUserSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }).max(50),
    lastName: z.string().min(1, { message: "Last name is required" }).max(50),
    gender: z.enum(["Male", "Female"], { message: "Please select a gender" }),
    email: z.string().email({ message: "Invalid email address" }),
    birthDate: z.coerce.date().refine((date) => {
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
        return age >= 13 && age <= 120;
    }, { message: "Age must be between 13 and 120 years" }),
    profileImage: z.any().optional(),
});



export const LoginSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
});



export const RegisterSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }).max(50),
    lastName: z.string().min(1, { message: "Last name is required" }).max(50),
    gender: z.enum(["Male", "Female"], { message: "Please select a gender" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(30),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});



export const AddLocalProductSchema = z.object({
    title: z.string().min(1, { message: 'Product title is required' })
        .max(50, { message: 'Product title must be at mosr 50 characters' }),
    category: z.string().min(1, { message: 'Category is required' }),
    brand: z.string().min(1, { message: 'Brand is required' }),
    price: z.number({ message: 'Price must be a number' })
        .min(0, { message: 'Price must be at least 0' }),
    stock: z.number({ message: 'Stock must be a number' })
        .min(0, { message: 'Stock must be at least 0' }),
    discountPercentage: z.number({ message: 'Discount Percentage must be a number' })
        .min(0, { message: 'Discount Percentage must be at least 0' })
        .max(100, { message: 'Discount Percentage cannot exceed 100' }),
    rating: z.number({ message: 'Rating must be a number' })
        .min(0, { message: 'Rating must be at least 0' })
        .max(5, { message: 'Rating cannot exceed 5' }),
    image: z.string().url({ message: 'Image must be a valid URL' }).optional().or(z.literal("")),
})

export const ContactFormSchema = z.object({
    senderName: z.string()
        .min(1, { message: "Name is required" })
        .max(100, { message: "Name must be at most 100 characters" }),
    senderEmail: z.string()
        .email({ message: "Invalid email address" }),
    subject: z.string()
        .min(1, { message: "Subject is required" })
        .max(200, { message: "Subject must be at most 200 characters" }),
    message: z.string()
        .min(10, { message: "Message must be at least 10 characters" })
        .max(2000, { message: "Message must be at most 2000 characters" }),
});

export const AdminReplySchema = z.object({
    adminName: z.string()
        .min(1, { message: "Admin name is required" })
        .max(100, { message: "Admin name must be at most 100 characters" }),
    adminEmail: z.string()
        .email({ message: "Invalid admin email address" }),
    recipientName: z.string()
        .min(1, { message: "Recipient name is required" })
        .max(100, { message: "Recipient name must be at most 100 characters" }),
    recipientEmail: z.string()
        .email({ message: "Invalid recipient email address" }),
    subject: z.string()
        .min(1, { message: "Subject is required" })
        .max(200, { message: "Subject must be at most 200 characters" }),
    message: z.string()
        .min(10, { message: "Reply message must be at least 10 characters" })
        .max(2000, { message: "Reply message must be at most 2000 characters" }),
    originalMessage: z.string()
        .min(1, { message: "Original message is required" }),
});



export type AddUserFormData = z.infer<typeof AddUserSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type AddLocalProductFormData = z.infer<typeof AddLocalProductSchema>;
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type AdminReplyData = z.infer<typeof AdminReplySchema>;