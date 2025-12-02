import * as React from "react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    footer?: React.ReactNode
    headerAction?: React.ReactNode
    variant?: "default" | "outline" | "ghost" | "destructive"
    size?: "sm" | "md" | "lg"
    loading?: boolean
    disabled?: boolean
}

const CustomCard = React.forwardRef<HTMLDivElement, CustomCardProps>(
    ({
        className,
        title,
        description,
        footer,
        headerAction,
        variant = "default",
        size = "md",
        loading = false,
        disabled = false,
        children,
        ...props
    }, ref) => {

        const cardVariants = {
            default: "border bg-card text-card-foreground shadow-sm",
            outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
            ghost: "border-0 bg-transparent shadow-none",
            destructive: "border-destructive/50 bg-destructive/10 text-destructive"
        }

        const cardSizes = {
            sm: "text-sm",
            md: "text-base",
            lg: "text-lg"
        }

        const headerSizes = {
            sm: "p-4",
            md: "p-6",
            lg: "p-8"
        }

        const contentSizes = {
            sm: "p-4 pt-0",
            md: "p-6 pt-0",
            lg: "p-8 pt-0"
        }

        const footerSizes = {
            sm: "p-4 pt-0",
            md: "p-6 pt-0",
            lg: "p-8 pt-0"
        }

        return (
            <Card
                ref={ref}
                className={cn(
                    "rounded-xl transition-colors",
                    cardVariants[variant],
                    cardSizes[size],
                    {
                        "opacity-50 pointer-events-none": disabled,
                        "animate-pulse": loading
                    },
                    className
                )}
                {...props}
            >
                {(title || description || headerAction) && (
                    <CardHeader className={cn(headerSizes[size])}>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                                {title && (
                                    <CardTitle className={cn(
                                        "font-semibold leading-none tracking-tight",
                                        {
                                            "text-sm": size === "sm",
                                            "text-base": size === "md",
                                            "text-lg": size === "lg"
                                        }
                                    )}>
                                        {title}
                                    </CardTitle>
                                )}
                                {description && (
                                    <CardDescription className={cn(
                                        "text-muted-foreground",
                                        {
                                            "text-xs": size === "sm",
                                            "text-sm": size === "md",
                                            "text-base": size === "lg"
                                        }
                                    )}>
                                        {description}
                                    </CardDescription>
                                )}
                            </div>
                            {headerAction && (
                                <div className="ml-4">
                                    {headerAction}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                )}

                {children && (
                    <CardContent className={cn(contentSizes[size])}>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-muted animate-pulse rounded" />
                                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                            </div>
                        ) : (
                            children
                        )}
                    </CardContent>
                )}

                {footer && (
                    <CardFooter className={cn(
                        "flex items-center",
                        footerSizes[size]
                    )}>
                        {footer}
                    </CardFooter>
                )}
            </Card>
        )
    }
)

CustomCard.displayName = "CustomCard"

export { CustomCard }
export type { CustomCardProps }
