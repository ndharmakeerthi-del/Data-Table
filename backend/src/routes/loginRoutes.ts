
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt, { SignOptions } from 'jsonwebtoken';
import Admin, { IAdmin } from '../models/Admin';
import { authenticateToken } from '../middleware/auth';



const router = Router();

const LoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const RegisterSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    gender: z.enum(["Male", "Female"], { message: "Please select a gender" }),
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginBody = z.infer<typeof LoginSchema>;
type RegisterBody = z.infer<typeof RegisterSchema>;

// Helper: sign JWT token
function signAuthToken(payload: object) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is not defined");
    const expiresIn = process.env.JWT_EXPIRES || '1d';
    return jwt.sign(payload, secret, { expiresIn: expiresIn } as SignOptions);
}

// Helper: set cookie
function setAuthCookie(res: Response, token: string) {
    const sevenDaysMs = 1 * 24 * 60 * 60 * 1000;
    // const sevenDaysMs = 60 * 1000;
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("token", token, {
        httpOnly: true,         // Prevent XSS attacks
        secure: isProduction,   // HTTPS only in production
        sameSite: "lax",       // CSRF protection
        maxAge: sevenDaysMs,   // 7 days expiration
        path: '/',             // Available across all paths
    });
}

//  POST /login
router.post(
    "/login",
    async (req: Request<{}, {}, LoginBody>, res: Response) => {
        try {
            console.log('Login request received:', req.body);

            const parsedBody = LoginSchema.safeParse(req.body);
            if (!parsedBody.success) {
                console.log('Validation failed:', parsedBody.error);
                return res.status(400).json({
                    success: false,
                    message: parsedBody.error.issues.map((e) => e.message).join(", "),
                });
            }

            const { username, password } = parsedBody.data;
            console.log('Looking for admin with username:', username);

            const admin = await Admin.findOne({ username });
            if (!admin) {
                console.log('Admin not found');
                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password",
                });
            }

            console.log('Admin found:', { id: admin.id, username: admin.username });

            // Check password
            const isMatch =
                typeof admin.comparePassword === 'function'
                    ? await admin.comparePassword(password)
                    : false;

            console.log('Password match:', isMatch);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password",
                });
            }

            const token = signAuthToken({
                sub: String(admin._id),
                id: admin.id,
                username: admin.username,
                role: admin.role,
            });

            setAuthCookie(res, token);

            return res.json({
                success: true,
                message: "Login successful",
                admin: {
                    _id: admin._id,
                    id: admin.id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    gender: admin.gender,
                    username: admin.username,
                    role: admin.role,
                },
            });
        } catch (error: any) {
            console.error("Login error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }
);

// POST /register
router.post(
    "/register",
    async (req: Request<{}, {}, RegisterBody>, res: Response) => {
        try {
            console.log('Register request received:', req.body);

            const parsedBody = RegisterSchema.safeParse(req.body);
            if (!parsedBody.success) {
                console.log('Validation failed:', parsedBody.error);
                return res.status(400).json({
                    success: false,
                    message: parsedBody.error.issues.map((e) => e.message).join(", "),
                });
            }

            const { firstName, lastName, gender, username, password } = parsedBody.data;

            // Check if username already exists
            const existingAdmin = await Admin.findOne({ username });
            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists",
                });
            }

            // Get the next ID
            const lastAdmin = await Admin.findOne().sort({ id: -1 });
            const nextId = lastAdmin ? lastAdmin.id + 1 : 1;

            // Create new admin
            const admin = new Admin({
                id: nextId,
                firstName,
                lastName,
                gender,
                username,
                password, // This will be hashed by the pre-save middleware
                role: 'user'
            });

            await admin.save();

            // Create JWT token and set cookie
            // const token = signAuthToken({
            //     sub: String(admin._id),
            //     id: admin.id,
            //     username: admin.username,
            //     role: admin.role,
            // });

            // setAuthCookie(res, token);

            // return res.status(201).json({
            //     success: true,
            //     message: "Registration successful",
            //     admin: {
            //         _id: admin._id,
            //         id: admin.id,
            //         firstName: admin.firstName,
            //         lastName: admin.lastName,
            //         gender: admin.gender,
            //         username: admin.username,
            //         role: admin.role,
            //     },
            // });
        } catch (error: any) {
            console.error("Registration error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error during registration",
            });
        }
    }
);

// POST /logout
router.post('/logout', (req: Request, res: Response) => {
    try {
        // Clear the auth cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
});

// GET /verify - verify token validity
router.get('/verify', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const admin = await Admin.findById(req.admin.sub).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        return res.json({
            success: true,
            message: 'Token is valid',
            admin: {
                _id: admin._id,
                id: admin.id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                gender: admin.gender,
                username: admin.username,
                role: admin.role,
            }
        });
    } catch (error: any) {
        console.error('Verify error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during verification'
        });
    }
});

// GET /me - get current authenticated admin
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const admin = await Admin.findById(req.admin.sub).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        return res.json({
            success: true,
            admin: {
                _id: admin._id,
                id: admin.id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                gender: admin.gender,
                username: admin.username,
                role: admin.role,
            }
        });
    } catch (error: any) {
        console.error('Get me error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;