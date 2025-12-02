import NavBar from "@/components/navbar/NavBar";
import { ThemeProvider } from "@/components/providers/theme-provide";
import { Home, User2, Archive, ArchiveX, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { AdminOnly, UserAccess } from "@/components/auth/RoleGuard";
import { env } from "@/config/env";

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, requiredRoles: ['user', 'admin'] },
    { name: 'Users', href: '/user', icon: User2, requiredRoles: ['admin'] },
    { name: 'Products', href: '/products', icon: Archive, requiredRoles: ['user', 'admin'] },
    { name: 'Local Products', href: '/local-products', icon: ArchiveX, requiredRoles: ['user', 'admin'] },
    { name: 'Contact', href: '/contact', icon: MessageCircle, requiredRoles: ['user'] },
]

export default function Dashboard({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    return (
        <ThemeProvider defaultTheme={env.DEFAULT_THEME as "light" | "dark" | "system"} storageKey={env.THEME_STORAGE_KEY}>
            <div className="flex h-screen bg-background">
                {/* Sidebar */}
                <div className={`flex flex-col bg-card border-r transition-all duration-300 ${
                    isCollapsed ? 'w-16' : 'w-64'
                }`}>
                    {/* Logo */}
                    <div className="flex items-center gap-2 p-4 border-b">
                        {!isCollapsed && (
                            <>
                                <img src='https://github.com/shadcn.png' alt='Logo' className='w-6 h-6 rounded-full' />
                                <span className="font-semibold">Dashboard</span>
                            </>
                        )}
                        {isCollapsed && (
                            <img src='https://github.com/shadcn.png' alt='Logo' className='w-8 h-8 rounded-full mx-auto' />
                        )}
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-4">
                            {!isCollapsed && (
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                    
                                </div>
                            )}
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                
                                // For admin-only items, use AdminOnly guard
                                if (item.requiredRoles.includes('admin') && item.requiredRoles.length === 1) {
                                    return (
                                        <AdminOnly key={item.name}>
                                            <Link
                                                to={item.href}
                                                className={`flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                } ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'}`}
                                                title={isCollapsed ? item.name : ''}
                                            >
                                                <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                                {!isCollapsed && item.name}
                                            </Link>
                                        </AdminOnly>
                                    );
                                }
                                
                                // For all authenticated users
                                return (
                                    <UserAccess key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={`flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            } ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'}`}
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                            {!isCollapsed && item.name}
                                        </Link>
                                    </UserAccess>
                                );
                            })}
                        </div>
                    </nav>
                </div>
                
                {/* Main content */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <NavBar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
                    <main className="flex-1 overflow-auto p-4">
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}
