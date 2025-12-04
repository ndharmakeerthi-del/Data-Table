import nodemailer from 'nodemailer';

export interface WelcomeEmailData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    username: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('❌ SMTP connection failed:', error);
            return false;
        }
    }

    async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
        try {
            const { email, firstName, lastName, password, username } = data;

            const mailOptions = {
                from: {
                    name: process.env.FROM_NAME || 'Data Table App',
                    address: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
                },
                to: email,
                subject: 'Welcome to Data Table App - Your Account Details',
                html: this.generateWelcomeEmailTemplate(firstName, lastName, username, password),
                text: this.generateWelcomeEmailText(firstName, lastName, username, password)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent successfully:', result.messageId);
            return true;

        } catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            return false;
        }
    }

    private generateWelcomeEmailTemplate(firstName: string, lastName: string, username: string, password: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; color: #2563eb; margin-bottom: 30px; }
                    .credentials-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .credential-value { background: #fff; padding: 8px 12px; border: 1px solid #dee2e6; border-radius: 4px; font-family: monospace; color: #dc3545; font-weight: bold; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; color: #856404; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Data Table App!</h1>
                        <p>Your account has been successfully created</p>
                    </div>
                    
                    <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                    
                    <p>Welcome! Your account has been created. Here are your login credentials:</p>
                    
                    <div class="credentials-box">
                        <p><strong>👤 Username:</strong><br><span class="credential-value">${username}</span></p>
                        <p><strong>🔑 Password:</strong><br><span class="credential-value">${password}</span></p>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This is a temporary password - please change it after login</li>
                            <li>Keep this email secure</li>
                            <li>Never share your credentials</li>
                        </ul>
                    </div>
                    
                    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">🚀 Login Now</a></p>
                    
                    <p>Best regards,<br><strong>Data Table App Team</strong></p>
                </div>
            </body>
            </html>
        `;
    }

    private generateWelcomeEmailText(firstName: string, lastName: string, username: string, password: string): string {
        return `
Welcome to Data Table App!

Dear ${firstName} ${lastName},

Your account has been created successfully.

Login Credentials:
Username: ${username}
Password: ${password}

IMPORTANT: This is a temporary password. Please change it after your first login.

Login at: ${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/login

Best regards,
Data Table App Team
        `.trim();
    }
}

export const emailService = new EmailService();