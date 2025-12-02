import { ROUTES } from './routes.constant';

export const NAV_ITEMS = [
    { 
        label: 'Dashboard', 
        path: ROUTES.HOME,
        roles: ['user', 'admin'] as ('user' | 'admin')[]
    },
    { 
        label: 'Products', 
        path: ROUTES.PRODUCTS,
        roles: ['user', 'admin'] as ('user' | 'admin')[]
    },
    { 
        label: 'Local Products', 
        path: ROUTES.LOCAL_PRODUCTS,
        roles: ['user', 'admin'] as ('user' | 'admin')[]
    },
    { 
        label: 'User Management', 
        path: ROUTES.USER,
        roles: ['admin'] as ('user' | 'admin')[]
    },
    { 
        label: 'Contact Support', 
        path: ROUTES.CONTACT,
        roles: ['user', 'admin'] as ('user' | 'admin')[]
    },
];

export const getAccessibleNavItems = (userRole: string | undefined) => {
    if (!userRole) return [];
    
    return NAV_ITEMS.filter(item => 
        item.roles.includes(userRole as 'user' | 'admin')
    );
};