import { useState } from "react";
import { CustomCard } from "@/components/customUi/customCard";
import { ContactForm } from "@/components/form/ContactForm";
import { CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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