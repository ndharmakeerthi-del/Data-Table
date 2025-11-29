import { useRole } from "@/hooks/useRole";
import { ReactNode } from "react";




interface RoleGuardProps {
    allowedRoles: string[];
    children: ReactNode;
    fallback?: ReactNode;
}


export function RoleGuard ({ allowedRoles, children, fallback = null } : RoleGuardProps) {

    const { hasAnyRole, role } = useRole();

    // If user is not logged in, don't show anything
    if (!role) {
        return <>{fallback}</>;
    }

    if(!hasAnyRole(allowedRoles)) {
        return (
            <>{fallback}</>
        )
    }

    return (
        <>{children}</>
    )
}


export const AdminOnly = ({ children, fallback = null } : { children: ReactNode; fallback?: ReactNode; }) => (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
        {children}
    </RoleGuard>
);

export const UserAccess = ({ children, fallback = null } : { children: ReactNode; fallback?: ReactNode; }) => (
    <RoleGuard allowedRoles={['user', 'admin']} fallback={fallback}>
        {children}
    </RoleGuard>
);