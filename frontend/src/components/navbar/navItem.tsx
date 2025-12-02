import { Link, useLocation } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { MessageCircle, Home, Archive, User2, LucideArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Navigation items with role-based access control
const NAV_ITEMS = [
    {
        label: 'Dashboard',
        path: '/',
        icon: Home,
        roles: ['user', 'admin']
    },
    {
        label: 'Products',
        path: '/products',
        icon: Archive,
        roles: ['user', 'admin']
    },
    {
        label: 'Local Products',
        path: '/local-products',
        icon: LucideArchive,
        roles: ['user', 'admin']
    },
    {
        label: 'Users',
        path: '/user',
        icon: User2,
        roles: ['admin'] // Admin only
    },
    {
        label: 'Contact',
        path: '/contact',
        icon: MessageCircle,
        roles: ['user'],
        badge: 'New' // Optional badge
    }
];

export default function NavItem() {
    const location = useLocation();
    const { role, hasAnyRole } = useRole();

    // Filter nav items based on user role
    const visibleNavItems = NAV_ITEMS.filter(item => 
        hasAnyRole(item.roles)
    );

    if (!role) {
        return null; // Don't show navigation if not authenticated
    }

    return (
        <nav className="border-b bg-white dark:bg-background shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center gap-6">
                    {/* <div className="flex items-center gap-2">
                        <img 
                            src='https://github.com/shadcn.png' 
                            alt='Logo' 
                            className='w- h-8 rounded-full' 
                        />
                        <h1 className="font-bold text-xl">Data Table</h1>
                    </div> */}
                    
                    <div className="flex items-center gap-2">
                        {visibleNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            
                            return (
                                <div key={item.path} className="relative">
                                    <Button
                                        asChild
                                        variant={isActive ? "default" : "ghost"}
                                        size="sm"
                                        className={`gap-2 ${
                                            isActive 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                    >
                                        <Link to={item.path}>
                                            <item.icon className="h-4 w-4" />
                                            <span className="hidden sm:inline">{item.label}</span>
                                        </Link>
                                    </Button>
                                    
                                    {item.badge && (
                                        <Badge 
                                            variant="secondary" 
                                            className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 bg-blue-500 text-white"
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}