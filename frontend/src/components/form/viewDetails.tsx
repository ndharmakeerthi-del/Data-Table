
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { X } from "lucide-react"







export interface FieldConfig {
    label: string;
    value: string | number | React.ReactNode;
    icon?: React.ReactNode;
}

export interface ViewDetailsProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    data: Record<string, any>;
    fieldLabels: Record<string, string>;
    hiddenFields?: string[];
    children?: React.ReactNode;
}

export function ViewDetails({ title = "Details", isOpen, onClose, children }: ViewDetailsProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background shadow-2xl border ring-1 ring-border/50">
                    <CardHeader className="relative pb-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold text-foreground">
                                    {title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">View detailed information</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-8 w-8 transition-all duration-200"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}