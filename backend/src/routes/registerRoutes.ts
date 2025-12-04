import { Router, Request, Response} from "express";
import Admin, { IAdmin } from "../models/Admin";
import { generateReadablePassword, validatePasswordStrength } from "../utils/passwordGenerator";
import { emailService } from "../services/emailService";

const router: Router = Router();

// POST register a new admin with auto-generated password
router.post('/', async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const { firstName, lastName, gender, username } = req.body;
        
        if (!firstName || !lastName || !gender || !username) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: firstName, lastName, gender, username (email)' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid email address' 
            });
        }

        // Check if username (email) already exists
        const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false,
                message: 'An account with this email already exists' 
            });
        }

        // Generate auto-increment ID
        const adminId = await Admin.find({ id: { $exists: true, $type: 'number'}}).sort({ id: -1});
        const maxId = adminId.length > 0 ? Math.max(...adminId.map(a => a.id)) : 0;
        const nextId = maxId + 1;

        // Generate secure password
        const generatedPassword = generateReadablePassword(10);
        console.log(`🔑 Generated password for ${username}: ${generatedPassword}`);

        // Validate generated password (just to be sure)
        const passwordValidation = validatePasswordStrength(generatedPassword);
        if (!passwordValidation.valid) {
            console.warn('Generated password failed validation, regenerating...');
            // Fallback to secure password if readable one fails
            const fallbackPassword = generateReadablePassword(12);
            console.log(`🔑 Fallback password for ${username}: ${fallbackPassword}`);
        }

        // Create admin data
        const adminData = {
            id: nextId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            gender: gender.trim(),
            username: username.toLowerCase().trim(),
            password: generatedPassword, // Will be hashed by pre-save middleware
            role: 'user' as const // Default role for new registrations
        };

        console.log(`📝 Creating new user account:`, {
            id: adminData.id,
            name: `${adminData.firstName} ${adminData.lastName}`,
            email: adminData.username,
            role: adminData.role
        });

        // Create and save new admin
        const newAdmin: IAdmin = new Admin(adminData);
        await newAdmin.save();

        console.log('✅ User account created successfully in database');

        // Attempt to send welcome email with credentials
        let emailSent = false;
        let emailError = null;

        try {
            console.log('📧 Attempting to send welcome email...');
            
            // Verify email service connection first
            const connectionValid = await emailService.verifyConnection();
            if (!connectionValid) {
                throw new Error('Email service connection failed');
            }

            const emailResult = await emailService.sendWelcomeEmail({
                email: username.toLowerCase().trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password: generatedPassword, // Send the plain password in email
                username: username.toLowerCase().trim()
            });

            if (emailResult) {
                console.log('✅ Welcome email sent successfully');
                emailSent = true;
            } else {
                throw new Error('Email sending failed');
            }

        } catch (error) {
            console.error('❌ Email sending error:', error);
            emailError = error instanceof Error ? error.message : 'Unknown email error';
            // Continue with registration even if email fails
        }

        // Return success response (don't include password in response)
        const { password, ...adminWithoutPassword } = newAdmin.toObject();
        
        const responseMessage = emailSent 
            ? 'Account created successfully! Check your email for login credentials.' 
            : 'Account created successfully, but email delivery failed. Please contact support for your credentials.';

        res.status(201).json({ 
            success: true,
            message: responseMessage,
            user: {
                id: adminWithoutPassword.id,
                firstName: adminWithoutPassword.firstName,
                lastName: adminWithoutPassword.lastName,
                gender: adminWithoutPassword.gender,
                username: adminWithoutPassword.username,
                role: adminWithoutPassword.role,
                createdAt: adminWithoutPassword.createdAt
            },
            emailSent,
            ...(emailError && { emailError }) // Include error only if exists
        });

    } catch (error: any) {
        console.error('💥 Registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false,
                message: `An account with this ${field} already exists`,
                error: 'Duplicate entry'
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Generic server error
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

export default router;