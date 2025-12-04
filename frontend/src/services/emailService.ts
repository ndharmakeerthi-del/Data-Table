import env from "@/config/env"
import emailjs from '@emailjs/browser';


const initEmailJS = () => {
    if (env.EMAILJS_USER_KEY) {
        emailjs.init(env.EMAILJS_USER_KEY)
    } else {
        console.warn('EmailJS user key not configured');
    }
};

initEmailJS();


// Interface for contact form data
// export interface ContactFormData {
//     senderName: string;
//     senderEmail: string;
//     subject: string;
//     message: string;
//     recipientEmail?: string;
// }

// EmailJS service class
export class EmailService {
    static async sendTemplate(templateId: string, templateParams: any): Promise<any> {
        try {

            if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_USER_KEY) {
                throw new Error('EmailJS configuration is incomplete. Please check your environment variables.');
            }

            // const templateParams = {
            //     from_name: data.senderName,
            //     from_email: data.senderEmail,    
            //     to_email: env.EMAILJS_ADMIN_EMAIL,
            //     to_name: 'Admin',
            //     subject: data.subject,
            //     message: data.message,
            //     reply_to: data.senderEmail,

            //     app_name: env.APP_NAME || 'Data Table App',
            //     timeStamp: new Date().toLocaleString(),
            // };

            
            const result = await emailjs.send(
                env.EMAILJS_SERVICE_ID,
                templateId,
                templateParams,
            );

            console.log('EmailJS success: ', result);
            return result;

        } catch (error) {
            console.error('EmailJS error:', error);
            throw error;
        }
    }

    static validateConfiguration(): { isValid: boolean; error: string[] } {
        const errors: string[] = [];

        if (!env.EMAILJS_SERVICE_ID) {
            errors.push('EMAILJS_SERVICE_ID is not configured');
        }

        if (!env.EMAILJS_TEMPLATE_ID) {
            errors.push('EMAILJS_TEMPLATE_ID is not configured');
        }

        if (!env.EMAILJS_USER_KEY) {
            errors.push('EMAILJS_USER_KEY is not configured');
        }

        if (!env.EMAILJS_ADMIN_EMAIL) {
            errors.push('EMAILJS_ADMIN_EMAIL is not configured');
        }

        return {
            isValid: errors.length === 0,
            error: errors,
        };
    }

    static getAdminContact() {
        return {
            email: env.EMAILJS_ADMIN_EMAIL,
            name: 'Administrator',
        }
    }
}

export default EmailService;