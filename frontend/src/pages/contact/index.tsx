import { useState } from "react";
import { CustomCard } from "@/components/customUi/customCard";
import { ContactForm } from "@/components/form/ContactForm";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageCircle,
    CheckCircle2,
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ContactPage() {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const navigate = useNavigate();

    const handleFormSuccess = () => {
        setShowSuccessMessage(true);
        // Auto-hide success message after 10 seconds
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 10000);
    };

    const handleFormError = (error: string) => {
        console.error("Contact form error:", error);
        // Error is already handled by toast in ContactForm
    };

    const contactInfo = [
        {
            icon: Mail,
            title: "Email",
            content: "support@datatable.com",
            description: "Send us an email anytime"
        },
        {
            icon: Phone,
            title: "Phone",
            content: "+1 (555) 123-4567",
            description: "Mon-Fri from 8am to 6pm"
        },
        {
            icon: MapPin,
            title: "Office",
            content: "123 Business St, Suite 100",
            description: "New York, NY 10001"
        },
        {
            icon: Clock,
            title: "Business Hours",
            content: "Monday - Friday",
            description: "8:00 AM - 6:00 PM EST"
        }
    ];

    const faqs = [
        {
            question: "How quickly will I receive a response?",
            answer: "We typically respond to all inquiries within 24-48 hours during business days."
        },
        {
            question: "What information should I include in my message?",
            answer: "Please provide as much detail as possible about your inquiry, including any relevant account information or error messages."
        },
        {
            question: "Can I call instead of using the contact form?",
            answer: "Yes! You can call us during business hours. However, using the contact form helps us track and prioritize your request."
        },
        {
            question: "Do you provide technical support?",
            answer: "Yes, we provide comprehensive technical support for all features of our platform."
        }
    ];

    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto px-4 py-8">
                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="mb-8">
                        <CustomCard
                            variant="default"
                            className="border-green-200 bg-green-50 dark:bg-green-950/20"
                        >
                            <div className="flex items-center gap-4 text-green-800 dark:text-green-200">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-lg">Message Sent Successfully!</h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Thank you for contacting us. We've received your message and will respond within 24-48 hours.
                                        You should also receive a confirmation email shortly.
                                    </p>
                                </div>
                            </div>
                        </CustomCard>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8">
                    {/* Contact Form */}
                    <div className="">
                        <ContactForm
                            onSuccess={handleFormSuccess}
                            onError={handleFormError}
                            className="h-fit"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}