import { s3Client, S3_BUCKET_NAME } from "../config/aws";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";




// Delete file from S3

export async function deleteFormS3 (key: string) : Promise<boolean> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('Error deleting from S3; ', error)
        return false;
    }
}

// Generate URL

export async function generateSingleUrl (key: string, expiresIn: number = 3600) : Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });

        return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
        console.error('Error generating signed URL; ', error);
        throw error;
    }
}



// Extract S3 key from S3 URL
export function extractS3KeyFromUrl (url: string) : string | null {
    try {
        const regex = new RegExp(`https://${S3_BUCKET_NAME}\\.s3\\.[^/]+\\.amazonaws\\.com/(.+)`);
        const match = url.match(regex);

        if (match) {
            return match[1];
        }

        const altRegex = new RegExp(`https://s3\\.[^/]+\\.amazonaws\\.com/${S3_BUCKET_NAME}/(.+)`);
        const altMatch = url.match(altRegex);

        return altMatch ? altMatch[1]: null;
    } catch (error) {
        console.error('Error extracting S3 key:', error);
        return null;
    }
}

// Validate S3 URL
export function isValidS3Url (url: string) : boolean {
    const s3Key = extractS3KeyFromUrl(url);
    return s3Key !== null && s3Key.startsWith('users/profile-images/');
}