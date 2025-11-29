import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            admin?: {
                sub: string;
                id: number;
                username: string;
                role: string;
            };
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is missing'
            });
        }

        // Verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not defined');
        }

        const decoded = jwt.verify(token, secret) as any;
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        
        if (token) {
            const secret = process.env.JWT_SECRET;
            if (secret) {
                const decoded = jwt.verify(token, secret) as any;
                req.admin = decoded;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};