"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface S3ImageUploadProps {
    value?: string | File; // ✅ Match ImageUpload interface
    onChange: (file: File | string) => void; // ✅ Match ImageUpload interface
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
}

// File validation function
const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
        return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, WebP)' };
    }
    
    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }
    
    return { valid: true };
};

export function S3ImageUpload({
    value,
    onChange,
    onError,
    disabled = false,
    className = "",
}: S3ImageUploadProps) {
    const [preview, setPreview] = useState<string>(() => {
        if (typeof value === 'string') return value;
        if (value instanceof File) return URL.createObjectURL(value);
        return "";
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file first
        const validation = validateFile(file);
        if (!validation.valid) {
            onError?.(validation.error || 'Invalid file');
            return;
        }

        setIsLoading(true);
        
        try {
            // Create preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewUrl = e.target?.result as string;
                setPreview(previewUrl);
            };
            reader.readAsDataURL(file);

            // Pass file to parent for delayed upload
            onChange(file);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [onChange, onError]);

    // Handle file input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled || isLoading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [disabled, isLoading, handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled && !isLoading) {
            setIsDragging(true);
        }
    }, [disabled, isLoading]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleRemove = useCallback(() => {
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }
        setPreview("");
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange, preview]);

    const handleBrowse = useCallback(() => {
        if (!disabled && !isLoading) {
            fileInputRef.current?.click();
        }
    }, [disabled, isLoading]);

    const isPendingFile = value instanceof File;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 transition-colors',
                    isDragging && !disabled
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400',
                    disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    !preview ? 'min-h-[200px]' : 'min-h-[100px]'
                )}
                onClick={!preview ? handleBrowse : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled || isLoading}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Processing image...</p>
                    </div>
                ) : preview ? (
                    <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {isPendingFile ? 'Image selected (will upload to S3 on save)' : 'Image ready'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isPendingFile ? 'Pending S3 upload' : 'Click to replace or remove'}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleBrowse}
                                disabled={disabled || isLoading}
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled || isLoading}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                            {isDragging ? <Upload className="w-full h-full" /> : <ImageIcon className="w-full h-full" />}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {isDragging ? 'Drop your image here' : 'Upload to S3'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag and drop or{' '}
                                <span className="text-primary font-medium">browse files</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supports: JPEG, PNG, WebP (Max: 5MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Image */}
            {preview && (
                <div className="relative">
                    <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {isPendingFile && (
                            <div className="absolute top-2 right-2">
                                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                    Pending S3 Upload
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default S3ImageUpload;