import { env } from '@/config/env';

// Supported file types
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Validate file before upload
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB',
    };
  }

  return { valid: true };
};

// Upload file to Cloudinary
export const uploadToCloudinary = async (
  file: File,
  // onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Validate environment variables
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_UPLOAD_PRESET) {
      return {
        success: false,
        error: 'Cloudinary configuration is missing. Please check your environment variables.',
      };
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', env.CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', env.CLOUDINARY_CLOUD_NAME);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || 'Upload failed',
      };
    }

    const data = await response.json();

    // Return the secure URL
    return {
      success: true,
      url: data.secure_url,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Generate optimized Cloudinary URLs
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the version and public_id
    const versionIndex = pathParts.findIndex(part => part.startsWith('v'));
    if (versionIndex === -1) return originalUrl;

    // Build transformation string
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    // Add crop mode for better aspect ratio handling
    if (options.width && options.height) {
      transformations.push('c_fill');
    }

    if (transformations.length === 0) return originalUrl;

    // Insert transformation into URL
    const transformationString = transformations.join(',');
    pathParts.splice(versionIndex, 0, transformationString);
    
    return `${url.protocol}//${url.host}${pathParts.join('/')}`;
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    return originalUrl;
  }
};

// Helper function to create thumbnail URLs
export const getThumbnailUrl = (originalUrl: string, size: number = 150): string => {
  return getOptimizedImageUrl(originalUrl, {
    width: size,
    height: size,
    quality: 80,
    format: 'auto',
  });
};

// Helper function to get display URLs for different contexts
export const getDisplayUrl = (
  originalUrl: string,
  context: 'thumbnail' | 'card' | 'full' = 'card'
): string => {
  const configs = {
    thumbnail: { width: 64, height: 64, quality: 70 },
    card: { width: 300, height: 300, quality: 80 },
    full: { width: 800, quality: 85 },
  };

  return getOptimizedImageUrl(originalUrl, configs[context]);
};