"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { validateFile } from '@/utils/upload';

interface ImageUploadProps {
    value?: string | File; // Can accept both URL and File
    onChange: (file: File | string) => void; // Can return both
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
    uploadMode?: 'immediate' | 'delayed'; // New prop to control when to upload
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onError,
    disabled = false,
    className,
    uploadMode = 'delayed', // Default to delayed upload
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
        if (typeof value === 'string') return value;
        if (value instanceof File) return URL.createObjectURL(value);
        return null;
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        async (file: File) => {
            // Validate file first
            const validation = validateFile(file);
            if (!validation.valid) {
                onError?.(validation.error || 'Invalid file');
                return;
            }

            // Create preview immediately
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            if (uploadMode === 'immediate') {
                // Original behavior - upload immediately
                // ... your existing upload logic
            } else {
                // Delayed mode - just pass the file to parent
                onChange(file);
            }
        },
        [onChange, onError, uploadMode]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragActive(false);

            if (disabled) return;

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                handleFile(files[0]);
            }
        },
        [disabled, handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) {
            setDragActive(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleRemove = useCallback(() => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange, previewUrl]);

    const handleBrowse = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    // Determine if we're showing a pending file
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
                    dragActive && !disabled
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    !previewUrl ? 'min-h-[200px]' : 'min-h-[100px]'
                )}
                onClick={!previewUrl ? handleBrowse : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                {previewUrl ? (
                    <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {isPendingFile ? 'Image selected (will upload on save)' : 'Image uploaded'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isPendingFile ? 'Pending upload' : 'Click to replace or remove'}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleBrowse}
                                disabled={disabled}
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                            {dragActive ? <Upload className="w-full h-full" /> : <ImageIcon className="w-full h-full" />}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {dragActive ? 'Drop your image here' : 'Upload an image'}
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
            {previewUrl && (
                <div className="relative">
                    <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {isPendingFile && (
                            <div className="absolute top-2 right-2">
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                                    Pending Upload
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;