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
        canAccessContact: isAdmin || isUser, // Added contact permission
        canManageContacts: isAdmin, // Admin-only contact management
        canViewContactStats: isAdmin,
    };
};

export const useNavigation = () => {
    const { role, hasAnyRole } = useRole();
    
    const getVisibleRoutes = () => {
        const routes = [
            { path: '/', label: 'Dashboard', roles: ['user', 'admin'] },
            { path: '/products', label: 'Products', roles: ['user', 'admin'] },
            { path: '/local-products', label: 'Local Products', roles: ['user', 'admin'] },
            { path: '/user', label: 'Users', roles: ['admin'] },
            { path: '/contact', label: 'Contact', roles: ['user', 'admin'] },
        ];
        
        return routes.filter(route => hasAnyRole(route.roles));
    };
    
    return {
        visibleRoutes: getVisibleRoutes(),
        role,
    };
};