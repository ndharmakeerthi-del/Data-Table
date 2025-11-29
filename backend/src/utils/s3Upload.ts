
import path from 'path';
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_REGION, S3_BUCKET_NAME, s3Client } from '../config/aws';
import { log } from 'console';




// Upload file buffer to s3
export async function uploadToS3(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId?: number
) : Promise<string> {
    try {

        // Generate unique filename
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        const extension = path.extname(fileName);
        const key = `users/profile-image/${userId || 'unknown'}/${uniqueSuffix}${extension}`;

        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            CacheControl: 'max-age=31536000', // 1 year
            Metadata: {
                originalName: fileName,
                uploadedAt: new Date().toString() || 'unknown',
            }
        });

        await s3Client.send(command);
        

        // Return the file URL
        return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Error uploading to s3:', error);
        throw new Error('Failed to upload image to S3');
        
    }
}

// Delete an object from S3
export async function deleteFromS3(url: string) : Promise<boolean> {
     try {
        const key = extractS3KeyFromUrl(url);
        if (!key) {
            console.error('Invalid S3 URL provided for deletion');
            return false;
        }

        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`Successfully deleted S3 object: ${key}`);
        return true;
     } catch (error) {
        console.error('Error deleting from S3:', error);
        return false;
     }
}

// Extract S3 key from S3 URL
export function extractS3KeyFromUrl(url: string): string | null {
    try {
        // Handle different S3 URL formats
        // Format 1: https://bucket.s3.region.amazonaws.com/key
        const regex = new RegExp(`https://${S3_BUCKET_NAME}\\.s3\\.[^/]+\\.amazonaws\\.com/(.+)`);
        const match = url.match(regex);
        
        if (match) {
            return decodeURIComponent(match[1]);
        }
        
        // Format 2: https://s3.region.amazonaws.com/bucket/key
        const altRegex = new RegExp(`https://s3\\.[^/]+\\.amazonaws\\.com/${S3_BUCKET_NAME}/(.+)`);
        const altMatch = url.match(altRegex);
        
        return altMatch ? decodeURIComponent(altMatch[1]) : null;
    } catch (error) {
        console.error('Error extracting S3 key:', error);
        return null;
    }
}

// Validate S3 URL
export function isValidS3Url(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const s3Key = extractS3KeyFromUrl(url);
    return s3Key !== null && s3Key.startsWith('users/profile-images/');
}

// Validate file type and size
export function validateImageFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        };
    }

    if (file.size > maxFileSize) {
        return {
            valid: false,
            error: 'File size too large. Maximum size is 5MB.'
        };
    }

    return { valid: true };
}
