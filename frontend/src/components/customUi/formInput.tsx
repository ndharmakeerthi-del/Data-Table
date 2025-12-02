'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface FormInputProps {
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

export function FormInput({
    control,
    name,
    label,
    type = 'text',
    placeholder,
    className = '',
    disabled = false,
    leftIcon,
    rightIcon,
}: FormInputProps) {
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
                            <Input
                                {...field}
                                type={type}
                                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                                disabled={disabled}
                                className={`${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
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