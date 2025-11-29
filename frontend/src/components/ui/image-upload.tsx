"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary, validateFile, getThumbnailUrl } from '@/utils/upload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  disabled = false,
  className,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.valid) {
        onError?.(validation.error || 'Invalid file');
        return;
      }

      setIsUploading(true);

      // Create preview immediately
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      try {
        const result = await uploadToCloudinary(file);
        
        if (result.success && result.url) {
          onChange(result.url);
          setPreviewUrl(result.url);
          // Clean up preview URL
          URL.revokeObjectURL(preview);
        } else {
          onError?.(result.error || 'Upload failed');
          setPreviewUrl(value || null);
          URL.revokeObjectURL(preview);
        }
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Upload failed');
        setPreviewUrl(value || null);
        URL.revokeObjectURL(preview);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onError, value]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      
      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, isUploading, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  }, [disabled, isUploading]);

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
    setPreviewUrl(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const handleBrowse = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive && !disabled && !isUploading
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
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
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium">Uploading image...</p>
            <p className="text-xs text-muted-foreground">Please wait while we upload your image</p>
          </div>
        ) : previewUrl ? (
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getThumbnailUrl(previewUrl, 64)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Image uploaded</p>
              <p className="text-xs text-muted-foreground">Click to replace or remove</p>
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

      {/* Preview Image (when image exists) */}
      {previewUrl && !isUploading && (
        <div className="relative">
          <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;