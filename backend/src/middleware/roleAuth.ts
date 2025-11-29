import { Request, Response, NextFunction } from 'express';


export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions"
            });
        }
        next();
    }
};

export const requireAdmin = requireRole(['admin']);
export const requireUser = requireRole(['user', 'admin']);