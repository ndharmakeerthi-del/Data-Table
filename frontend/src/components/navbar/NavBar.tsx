import { LogOut, Moon, Settings, Sun, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import { useTheme } from "../providers/theme-provide";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";

interface NavBarProps {
    onToggleSidebar?: () => void;
}

const NavBar = ({ onToggleSidebar }: NavBarProps) => {
    const { setTheme } = useTheme();
    const { admin } = useAuthStore();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        const first = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
        const last = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || 'AD';
    };

    return (
        <nav className="w-full p-4 flex justify-between items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                {onToggleSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        className="h-8 w-8"
                    >
                        <Menu className="h-4 w-4" />
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                )}
                <Link to="/" className="font-semibold">Dashboard</Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {/* THEME MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* USER MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>
                                {admin ? getInitials(admin.firstName, admin.lastName) : 'AD'}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={10}>
                        <DropdownMenuLabel>
                            {admin ? `${admin.firstName} ${admin.lastName}` : 'My Account'}
                        </DropdownMenuLabel>
                        {admin?.role && (
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                                Role: {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                            </DropdownMenuLabel>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500" 
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                        >
                            <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}

export default NavBar;