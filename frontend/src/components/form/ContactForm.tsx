'use client';

import { ContactFormSchema, type ContactFormData } from "@/schemas";
import EmailService from "@/services/emailService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustomCard } from "../customUi/customCard";
import { Form } from "../ui/form";
import { Mail, MessageCircle, Send, User } from "lucide-react";
import { Button } from "../ui/button";
import { FormInput } from "../customUi/formInput";
import { FormTextArea } from "../customUi/formTextArea";
import env from "@/config/env";






interface ContactFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    className?: string;
}


export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, onError, className }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: {
            senderName: "",
            senderEmail: "",
            subject: "",
            message: "",
        },
        mode: "onChange",
    });

    const handleSubmit = async (values: ContactFormData) => {
        setIsSubmitting(true);

        try {
            const validation = EmailService.validateConfiguration();
            if (!validation.isValid) {
                throw new Error(`Email configuration error: ${validation.error.join(", ")}`);
            }

            const templateData = {
                from_name: values.senderName,
                from_email: values.senderEmail,
                to_email: env.EMAILJS_ADMIN_EMAIL,
                subject: values.subject,
                message: values.message,
                reply_to: values.senderEmail,
                app_name: env.APP_NAME,
                timeStamp: new Date().toLocaleString(),
            }
            
            await EmailService.sendTemplate(env.EMAILJS_TEMPLATE_ID!, templateData);

            toast.success("Message sent successfully! YOU will receive a confirmation email shortly.");
            form.reset();
            onSuccess && onSuccess();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
            toast.error(errorMessage);
            onError?.(errorMessage);
            console.error("Contact form error:", error);
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <CustomCard
            title="Contact Us"
            description="Send us a message and we'll get back to you as soon as possible."
            className={className}
            variant="default"
            size="lg"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            control={form.control}
                            name="senderName"
                            label="Full Name"
                            type="text"
                            placeholder="Enter your full name"
                            disabled={isSubmitting}
                            leftIcon={<User className="h-4 w-4" />}
                        />
                        <FormInput
                            control={form.control}
                            name="senderEmail"
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email address"
                            disabled={isSubmitting}
                            leftIcon={<Mail className="h-4 w-4" />}
                        />
                    </div>

                    <FormInput
                        control={form.control}
                        name="subject"
                        label="Subject"
                        type="text"
                        placeholder="What is this regarding?"
                        disabled={isSubmitting}
                        leftIcon={<MessageCircle className="h-4 w-4" />}
                    />

                    <FormTextArea
                        control={form.control}
                        name="message"
                        label="Message"
                        placeholder="Please provide details about your inquiry..."
                        disabled={isSubmitting}
                        className="w-full h-32"
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !form.formState.isValid}
                            className="min-w-[120px] gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </CustomCard>
    )
}

export default ContactForm;