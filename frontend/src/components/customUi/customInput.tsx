import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CustomInputProps extends React.ComponentProps<"input"> {
    label?: string
    error?: string
    helperText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    containerClassName?: string
    labelClassName?: string
}


const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            containerClassName,
            labelClassName,
            className,
            id,
            ...props
        }, ref
    ) => {
        const inputId = id || React.useId();

        return (
            <div className={cn("w-full space-y-2", containerClassName)}>
                <div>
                    {label && (
                        <label
                            htmlFor={inputId}
                            className={cn(
                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                error && "text-destructive",
                                labelClassName
                            )}
                        >
                            {label}
                        </label>
                    )}
                </div>

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}

                    <Input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                        }
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p
                        id={`${inputId}-helper`}
                        className="text-sm text-muted-foreground"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)


export default CustomInput