import { ReactNode } from "react";
import { useRole } from "@/hooks/useRole";
import { Navigate } from "react-router-dom";




interface RoleProtectedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
    fallbackPath?: string;
    fallbackComponent?: ReactNode;
}

export function RoleProtectedRoute({
    children,
    allowedRoles,
    fallbackPath = "/dashboard",
    fallbackComponent = null,
} : RoleProtectedRouteProps) {
    const { hasAnyRole, role } = useRole();

    if (!role) {
        return <Navigate to="/login" replace />
    }

    if (!hasAnyRole(allowedRoles)) {
        if (fallbackComponent) {
            return(
                <>
                    {fallbackComponent}
                </>
            )
        }
        return <Navigate to={fallbackPath} replace />
    }

    return (
        <>
         {children}
        </>
    )
}


export const AdminOnlyRoute = ({ children }: { children: ReactNode }) => (
    <RoleProtectedRoute allowedRoles={['admin']}>
        {children}
    </RoleProtectedRoute>
);

export const UserAndAdminRoute = ({ children }: { children: ReactNode }) => (
    <RoleProtectedRoute allowedRoles={['user', 'admin']}>
        {children}
    </RoleProtectedRoute>
);