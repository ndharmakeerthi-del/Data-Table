import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleAuth';
import { uploadSingleImage } from '../middleware/s3Upload';
import {
    uploadToS3,
    deleteFromS3,
    validateImageFile,
    isValidS3Url
} from '../utils/s3Upload';
import multer from 'multer';
import { success } from 'zod';
import { log } from 'console';

const router: Router = Router();

// Apply authentication and admin-only access to all user routes
router.use(authenticateToken);
router.use(requireAdmin);

// Configure multer for memory storage (for S3 upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    }
})

// GET all users with pagination
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
        const search = req.query.search as string;
        const skip = (page - 1) * limit;

        console.log('User API called with params:', { page, limit, search });

        // Build query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { birthDate: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get total count
        const totalUsers = await User.countDocuments(query);

        // Get paginated results
        const users = await User.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ id: 1 }); // Sort by user ID in ascending order

        const totalPages = Math.ceil(totalUsers / limit);

        console.log('User pagination response:', {
            page,
            limit,
            totalUsers,
            totalPages,
            userCount: users.length
        });

        return res.json({
            success: true,
            data: users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error('Users pagination error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST create a new user
router.post('/', upload.single('profileImage'), async (req: Request, res: Response) => {
    try {
        // Get all users that have numeric IDs and find the highest one
        const usersId = await User.find({ id: { $exists: true, $type: 'number' } }).sort({ id: -1 });
        const maxId = usersId.length > 0 ? Math.max(...usersId.map(u => u.id)) : 0;
        const nextId = maxId + 1;

        console.log('Users with numeric IDs:', usersId.map(u => ({ id: u.id, name: u.firstName })));
        console.log('Max ID found:', maxId);
        console.log('Next ID:', nextId);

        // Create new user with generated ID
        const userData = {
            ...req.body,
            id: nextId
        };

        // Handle image upload of file is provided
        if (req.file) {
            console.log('Processing image upload...');

            const validation = validateImageFile(req.file);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            try {
                // Upload to S3
                const imageUrl = await uploadToS3(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype,
                    nextId
                );

                userData.profileImage = imageUrl;
                console.log('Image uploaded successfully:', imageUrl);
            } catch (uploadError) {
                console.error('S3 upload error', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Faild to upload profile image'
                })

            }
        }

        const newUser: IUser = new User(userData);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT update a user
router.put('/:id', upload.single('profileImage'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log('Updating user:', id);
        console.log('Request body:', req.body);
        console.log('File uploaded', !!req.file);

        // Find existing user
        const existingUser = await User.findOne({ id: id });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare update data
        const updateData: any = { ...req.body };

        // Handle image upload if dile is proided
        if (req.file) {
            console.log('Processong image update...');

            // Validate the uploaded file
            const validation = validateImageFile(req.file);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            try {
                // Delete old image if it exists
                if (existingUser.profileImage && isValidS3Url(existingUser.profileImage)) {
                    console.log('Deleting old image:', existingUser.profileImage);
                    await deleteFromS3(existingUser.profileImage);
                }

                // Upload new image to S3
                const imageUrl = await uploadToS3(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype,
                    parseInt(id)
                );

                updateData.profileImage = imageUrl;
                console.log('New image uploaded successfully:', imageUrl);
            } catch (uploadError) {
                console.error('S3 upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Faild to upload profile image'
                });
            }
        }

        // Update user
        const updatedUser = await User.findOneAndUpdate(
            { id: id },
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE a user
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find existing user
        const userToDelete = await User.findOne({ id: id });
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete profile image from S3 if it exists
        if (userToDelete.profileImage && isValidS3Url(userToDelete.profileImage)) {
            console.log('Deleting user image from S3:', userToDelete.profileImage);
            const deleted = await deleteFromS3(userToDelete.profileImage);
            if (!deleted) {
                console.warn('Failed to delete user image from S3, but continuing with user deletion');
            }
        }

        // Delete the user from database
        const deleteUser = await User.findOneAndDelete({ id: id });

        res.json({
            success: true,
            message: 'User deleted successfully',
            data: deleteUser
        });

    } catch (error: any) {
        console.log('Error deleting user:', error);
        
        res.status(400).json({ 
            success: false,
            message: error.message
         });
    }
});

// Delete user profile image only
router.delete('/:id/profile-image', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find user
        const user = await User.findOne({ id: id });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has profile image
        if (!user.profileImage) {
            return res.status(400).json({
                success: false,
                message: 'User does not have a profile image to delete'
            });
        }

        // Delete profile image from S3
        if (isValidS3Url(user.profileImage)) {
            console.log('Deleting profile image from S3:', user.profileImage);
            const deleted = await deleteFromS3(user.profileImage);
            if (!deleted) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete profile image from S3'
                });
            }
        }

        // Remove profile image URL from user document
        const updateUser = await User.findOneAndUpdate(
            { id: id },
            { $unset: { profileImage: ""} },
            { new: true }
        );

        res.json({

            success: true,
            message: 'Profile image deleted successfully',
            data: updateUser
        });
    } catch (error: any) {
        console.log('Error deleting profile image: ', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
})

// GET a single user by id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ id: id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;