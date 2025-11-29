import multer from 'multer';
import { Request } from 'express';
import { S3_BUCKET_NAME, s3Client } from '../config/aws';
import path from 'path'
import multerS3 from 'multer-s3';




const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB


const fileFilter = (req: Request & { body?: any }, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
};                                                                                                                                                                                        


export const uploadToS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: S3_BUCKET_NAME,
        metadata: function (req: Request & { body?: any }, file, cb) {
            cb(null, {
                fieldName: file.fieldname,
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
                userId: req.body.userId || 'unknown'
            });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() +'_' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = `users/profile-images/${uniqueSuffix}${extension}`;
            cb(null, filename);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        cacheControl: 'max-age=31536000', // 1 year
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: maxFileSize,
        files: 1,
    }
});


export const uploadSingleImage = uploadToS3.single('profileImage');