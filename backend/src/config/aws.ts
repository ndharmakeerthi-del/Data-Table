


import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';



dotenv.config();



const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
]
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error('Missing required environment variable: ' + envVar);
    }
}

export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});


export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
export const AWS_REGION = process.env.AWS_REGION!;