import { useAuthStore } from "@/store/authStore"



export const useRole = () => {
    const { admin } = useAuthStore();

    const isAdmin = admin?.role === 'admin';
    const isUser = admin?.role === "user";

    const hasRole = (role: string) => admin?.role === role;
    const hasAnyRole = (roles: string[]) => admin?.role? roles.includes(admin.role) : false;

    return {
        role: admin?.role,
        isAdmin,
        isUser,
        hasRole,
        hasAnyRole,
    };
};


export const usePermissions = () => {
    const { isAdmin, isUser } = useRole();
    
    return {
        canViewUsers: isAdmin,
        canEditUsers: isAdmin,
        canDeleteUsers: isAdmin,
        canViewProducts: isAdmin || isUser,
        canEditProducts: isAdmin,
        canDeleteProducts: isAdmin,
        canAccessAdminPanel: isAdmin,
        canAccessDashboard: isAdmin || isUser,
    };
};