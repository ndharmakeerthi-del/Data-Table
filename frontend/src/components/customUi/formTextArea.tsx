'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';

interface FormTextAreaProps {
    control: Control<any>;
    name: string;
    label: string;
    type?: 'text' | 'email' | 'date' | 'number' | 'password';
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function FormTextArea({
    control,
    name,
    label,
    placeholder,
    className = '',
    disabled = false,
    leftIcon,
    rightIcon,
}: FormTextAreaProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            {leftIcon && (
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    {leftIcon}
                                </div>
                            )}
                            <Textarea
                                {...field}
                                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                                disabled={disabled}
                                className={`${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
                            />
                            {rightIcon && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {rightIcon}
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}