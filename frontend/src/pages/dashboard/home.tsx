import React, { useMemo } from "react"
import { CustomCard } from "@/components/customUi/customCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleBarChart, SimpleLineChart, SimpleDonutChart } from "@/components/charts/SimpleCharts"
import { DollarSign, Users, Activity, ArrowUpRight, ArrowDownRight, TrendingUp, Package, Star, Shield, Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUsersStore } from "@/store/usersStore"
import { useQuery } from "@tanstack/react-query"
import { fetchProducts, Product } from "@/apis/products"
// import { useRole } from "@/hooks/useRole"
import { AdminOnly, UserAccess } from "@/components/auth/RoleGuard"
import { useAuthStore } from "@/store/authStore"

const MetricCard: React.FC<{
    title: string
    value: string
    change: string
    trend: "up" | "down"
    icon: React.ElementType
}> = ({ title, value, change, trend, icon: Icon }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={cn(
                    "text-xs flex items-center gap-1",
                    trend === "up" ? "text-green-600" : "text-red-600"
                )}>
                    {trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3" />
                    )}
                    {change}
                </p>
            </CardContent>
        </Card>
    )
}

const SimpleChart: React.FC<{ data: Array<{ name: string; value: number }> }> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value))

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{item.name}</div>
                    <div className="flex-1">
                        <div className="bg-muted rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    )
}

const DashboardHome: React.FC = () => {
    // Get current user role
    // const { role, isAdmin, isUser } = useRole()
    
    // Get users from store
    const users = useUsersStore((state) => state.users)
    
    // Get auth store - moved here to fix hooks order violation
    const { admin } = useAuthStore();

    // Fetch products using TanStack Query
    const { data: products = [], isLoading: isProductsLoading } = useQuery<Product[], Error>({
        queryKey: ["products"],
        queryFn: fetchProducts,
    })

    // Calculate metrics from real data
    const metrics = useMemo(() => {
        const totalUsers = users.length
        const totalProducts = products.length
        const totalValue = products.reduce((sum, product) => sum + product.price, 0)
        const averageRating = products.length > 0
            ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
            : 0
        const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
        const lowStockProducts = products.filter(product => product.stock < 20).length

        return {
            totalUsers,
            totalProducts,
            totalValue,
            averageRating,
            totalStock,
            lowStockProducts
        }
    }, [users, products])

    // Calculate gender distribution
    const genderData = useMemo(() => {
        const genderCounts = users.reduce((acc, user) => {
            acc[user.gender] = (acc[user.gender] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return [
            { name: "Male", value: genderCounts.Male || 0, color: "hsl(var(--chart-1))" },
            { name: "Female", value: genderCounts.Female || 0, color: "hsl(var(--chart-2))" }
        ]
    }, [users])

    // Calculate category distribution for charts
    const monthlyData = useMemo(() => {
        const categories = [...new Set(products.map(p => p.category))]
        return categories.slice(0, 6).map((category) => ({
            name: category.slice(0, 3),
            value: products.filter(p => p.category === category).length
        }))
    }, [products])

    // Recent activity based on latest users
    const recentActivity = useMemo(() => {
        return users.slice(-5).map(user => ({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            amount: `+$${Math.floor(Math.random() * 500 + 50)}` // Simulated purchase
        }))
    }, [users])

    const dashboardMetrics = [
        {
            title: "Total Users",
            value: metrics.totalUsers.toString(),
            change: `${users.length > 0 ? '+' : ''}${Math.floor(Math.random() * 20 + 5)}% from last month`,
            trend: "up" as const,
            icon: Users
        },
        {
            title: "Total Products",
            value: metrics.totalProducts.toString(),
            change: `+${Math.floor(Math.random() * 15 + 3)}% from last month`,
            trend: "up" as const,
            icon: Package
        },
        {
            title: "Total Value",
            value: `$${metrics.totalValue.toLocaleString()}`,
            change: `+${Math.floor(Math.random() * 25 + 10)}% from last month`,
            trend: "up" as const,
            icon: DollarSign
        },
        {
            title: "Avg Rating",
            value: metrics.averageRating.toFixed(1),
            change: `+${(Math.random() * 0.5 + 0.1).toFixed(1)} from last month`,
            trend: "up" as const,
            icon: Star
        }
    ]

    if (isProductsLoading) {
        return (
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading dashboard data...</div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="flex-1 space-y-4">
            {/* Welcome Section */}
            <div className="flex items-center justify-between space-y-2 pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome {admin?.firstName} {admin?.lastName}! </h2>
                    <AdminOnly>
                        <p className="text-muted-foreground">
                            Welcome back, Administrator. Here's your system overview.
                        </p>
                    </AdminOnly>
                    <UserAccess>
                        <p className="text-muted-foreground">
                            Welcome back! Here's what's happening in your workspace.
                        </p>
                    </UserAccess>
                </div>
                <AdminOnly>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                        </Button>
                        <Button size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </AdminOnly>
            </div>

            <div className="space-y-4">
                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Admin sees all metrics, Users see limited metrics */}
                    <AdminOnly>
                        {dashboardMetrics.map((metric, index) => (
                            <MetricCard
                                key={index}
                                title={metric.title}
                                value={metric.value}
                                change={metric.change}
                                trend={metric.trend}
                                icon={metric.icon}
                            />
                        ))}
                    </AdminOnly>
                    
                    <UserAccess>
                        {/* Users only see product and value metrics */}
                        {dashboardMetrics.slice(1).map((metric, index) => (
                            <MetricCard
                                key={index}
                                title={metric.title}
                                value={metric.value}
                                change={metric.change}
                                trend={metric.trend}
                                icon={metric.icon}
                            />
                        ))}
                    </UserAccess>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Overview Chart */}
                    <CustomCard
                        className="col-span-4"
                        title="Product Categories"
                        description="Distribution of products by category"
                    >
                        <SimpleChart data={monthlyData} />
                    </CustomCard>

                    {/* Recent Activity - Admin Only */}
                    <AdminOnly>
                        <CustomCard
                            className="col-span-3"
                            title="Recent Users"
                            description={`You have ${users.length} registered users.`}
                        >
                            <div className="space-y-8">
                                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            <span className="text-sm font-medium">
                                                {activity.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {activity.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.email}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            Recent signup
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-muted-foreground">
                                        No users registered yet
                                    </div>
                                )}
                            </div>
                        </CustomCard>
                    </AdminOnly>
                    
                    {/* Product Summary for Users */}
                    <UserAccess>
                        <CustomCard
                            className="col-span-3"
                            title="Product Overview"
                            description="Your available products summary"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Products</span>
                                    <span className="font-medium">{products.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Average Rating</span>
                                    <span className="font-medium">{metrics.averageRating.toFixed(1)} ⭐</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Value</span>
                                    <span className="font-medium">${metrics.totalValue.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">In Stock</span>
                                    <span className="font-medium">{metrics.totalStock}</span>
                                </div>
                            </div>
                        </CustomCard>
                    </UserAccess>
                </div>

                {/* Enhanced Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <CustomCard
                        title="Category Trends"
                        description="Products by category"
                    >
                        <SimpleBarChart data={monthlyData} height={200} />
                    </CustomCard>

                    <CustomCard
                        title="Product Growth"
                        description="Category distribution over time"
                    >
                        <SimpleLineChart data={monthlyData} height={200} />
                    </CustomCard>

                    <CustomCard
                        title="User Demographics"
                        description="Gender distribution"
                    >
                        <SimpleDonutChart data={genderData} size={180} />
                    </CustomCard>
                </div>

                {/* Analytics Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <CustomCard
                        title="Total Stock"
                        description="Available inventory"
                        variant="outline"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">{metrics.totalStock.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    {metrics.lowStockProducts} low stock items
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CustomCard>

                    <CustomCard
                        title="Average Price"
                        description="Per product value"
                        variant="outline"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">
                                    ${products.length > 0 ? (metrics.totalValue / products.length).toFixed(2) : '0.00'}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    Across {products.length} products
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CustomCard>

                    <CustomCard
                        title="User Engagement"
                        description="Registration activity"
                        variant="outline"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">{users.length}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    Total registered users
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CustomCard>
                </div>
            </div>
        </div>
    )
}

export default DashboardHome