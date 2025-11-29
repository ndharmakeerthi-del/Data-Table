"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface S3ImageUploadProps {
    value?: string;
    onChange: (file: File | null, preview?: string) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
}

export function S3ImageUpload({
    value,
    onChange,
    onError,
    disabled = false,
    className = "",
}: S3ImageUploadProps) {
    const [preview, setPreview] = useState<string>(value || "");
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Validate file
    const validateFile = (file: File): { valid: boolean; error?: string } => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'File size too large. Maximum size is 5MB.'
            };
        }

        return { valid: true };
    };

    // Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        setIsLoading(true);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            const errorMsg = validation.error || 'Invalid file';
            toast.error(errorMsg);
            onError?.(errorMsg);
            setIsLoading(false);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewUrl = e.target?.result as string;
            setPreview(previewUrl);
            onChange(file, previewUrl);
            setIsLoading(false);
        };
        reader.onerror = () => {
            const errorMsg = 'Failed to read file';
            toast.error(errorMsg);
            onError?.(errorMsg);
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    }, [onChange, onError]);

    // Handle file input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            handleFileSelect(files[0]);
        }
    }, [disabled, handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    // Remove image
    const handleRemove = () => {
        setPreview("");
        onChange(null);
        
        // Reset input
        const input = document.getElementById('s3-image-input') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {preview ? (
                // Preview mode
                <div className="relative group">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {isLoading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    
                    {!disabled && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {!disabled && (
                        <div className="mt-2">
                            <label htmlFor="s3-image-input" className="cursor-pointer">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    asChild
                                >
                                    <span>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Change Image
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </label>
                            <input
                                id="s3-image-input"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleInputChange}
                                disabled={disabled || isLoading}
                                className="hidden"
                            />
                        </div>
                    )}
                </div>
            ) : (
                // Upload area
                <div
                    className={`
                        relative w-full h-48 border-2 border-dashed rounded-lg
                        flex flex-col items-center justify-center p-6 transition-colors
                        ${isDragging 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-300 hover:border-gray-400'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => {
                        if (!disabled) {
                            document.getElementById('s3-image-input')?.click();
                        }
                    }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-3" />
                            <p className="text-sm text-gray-600">Processing image...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 text-center mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 text-center">
                                JPEG, PNG, WebP up to 5MB
                            </p>
                        </div>
                    )}

                    <input
                        id="s3-image-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleInputChange}
                        disabled={disabled || isLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>
            )}
        </div>
    );
}