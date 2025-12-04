"use client";

import { useEffect, useState } from "react";
import { z, ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type DefaultValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Input from "@/components/customUi/customInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { S3ImageUpload } from "../ui/s3-image-upload";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/upload";

// Keep your existing interfaces...
export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "password" | "image" | "s3-image";
    placeholder?: string;
    options?: string[];
}

interface AddFormProps<T extends ZodSchema<any>> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schema: T;
    fields: FieldConfig[];
    onSubmit: (data: z.infer<T>, file?: File) => void | Promise<void>; // Support file parameter
    title?: string;
    description?: string;
    defaultValues?: Partial<z.infer<T>>;
    submitLabel?: string;
    isSubmitting?: boolean;
}

export function AddForm<T extends ZodSchema<FieldValues, any, any>>({
    open,
    onOpenChange,
    schema,
    fields,
    onSubmit,
    title,
    description,
    defaultValues,
    submitLabel = "Add",
    isSubmitting = false,
}: AddFormProps<T>) {

    // Track pending files for upload
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema) as any,
        defaultValues: defaultValues as DefaultValues<z.infer<T>> | undefined,
        mode: "onChange",
    });

    // Reset form and pending files when dialog closes or defaults change
    useEffect(() => {
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            form.reset(defaultValues as any);
            setPendingFiles({});
            setUploadProgress({});
        }
    }, [defaultValues, form]);

    // Handle file selection (store file, don't upload yet)
    const handleFileChange = (fieldName: string, fileOrUrl: File | string) => {
        if (fileOrUrl instanceof File) {
            // File selected - store for later upload
            setPendingFiles(prev => ({ ...prev, [fieldName]: fileOrUrl }));
            form.setValue(fieldName as any, 'file-pending' as any); // Temporary value
        } else {
            // URL provided or removed
            setPendingFiles(prev => {
                const updated = { ...prev };
                delete updated[fieldName];
                return updated;
            });
            form.setValue(fieldName as any, fileOrUrl as any);
        }
    };

    // Upload all pending files
    const uploadPendingFiles = async (): Promise<Record<string, string>> => {
        const uploadedUrls: Record<string, string> = {};
        const fileEntries = Object.entries(pendingFiles);

        if (fileEntries.length === 0) {
            return uploadedUrls;
        }

        setIsUploadingFiles(true);

        try {
            for (const [fieldName, file] of fileEntries) {
                setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

                try {
                    const fieldConfig = fields.find(f => f.name === fieldName);
                    
                    // Only handle Cloudinary uploads here - S3 handled by form submission
                    if (fieldConfig?.type === 'image') {
                        const result = await uploadToCloudinary(file);
                        
                        if (result.success && result.url) {
                            uploadedUrls[fieldName] = result.url;
                            setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
                            toast.success(`${fieldName} uploaded successfully to Cloudinary`);
                        } else {
                            throw new Error(result.error || 'Upload failed');
                        }
                    }
                    // S3 files will be handled by form submission directly
                } catch (uploadError) {
                    setUploadProgress(prev => ({ ...prev, [fieldName]: -1 }));
                    const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
                    throw new Error(`Failed to upload ${fieldName}: ${errorMessage}`);
                }
            }

            return uploadedUrls;
        } finally {
            setIsUploadingFiles(false);
        }
    };

    // Enhanced form submission with file uploads
    async function handleSubmit(values: z.infer<T>) {
        try {
            setIsUploadingFiles(true);
            
            // Upload Cloudinary files first and get URLs
            const uploadedUrls = await uploadPendingFiles();
            
            // Merge uploaded URLs into form data
            const finalFormData = { ...values };
            for (const [fieldName, url] of Object.entries(uploadedUrls)) {
                finalFormData[fieldName as keyof typeof finalFormData] = url as any;
            }
            
            // Check if we have any S3 files that need to be passed to backend
            const s3Files: Record<string, File> = {};
            for (const [fieldName, file] of Object.entries(pendingFiles)) {
                const fieldConfig = fields.find(f => f.name === fieldName);
                if (fieldConfig?.type === 's3-image') {
                    s3Files[fieldName] = file;
                }
            }
            
            // Submit form - pass S3 files separately if any
            if (Object.keys(s3Files).length > 0) {
                // Has S3 files - pass the first one as file parameter
                const s3File = Object.values(s3Files)[0];
                await onSubmit(finalFormData, s3File);
            } else {
                // No S3 files - normal submission
                await onSubmit(finalFormData);
            }
            
            // Success - clean up and close
            toast.success(`${submitLabel} successful!`);
            form.reset();
            setPendingFiles({});
            setUploadProgress({});
            onOpenChange(false);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to ${submitLabel.toLowerCase()}`;
            toast.error(errorMessage);
            console.error('Form submission error:', error);
        } finally {
            setIsUploadingFiles(false);
        }
    }    // Enhanced cancel with cleanup
    const handleCancel = () => {
        // Clean up any blob URLs from pending files
        Object.values(pendingFiles).forEach(file => {
            if (file instanceof File) {
                // The URLs are created in ImageUpload component
                // No need to clean up here as component handles it
            }
        });

        setPendingFiles({});
        setUploadProgress({});
        form.reset();
        onOpenChange(false);

        if (Object.keys(pendingFiles).length > 0) {
            toast.info('Upload cancelled - no files were saved');
        }
    };

    // Enhanced render input with file handling
    const renderInput = (cfg: FieldConfig, field: any) => {
        if (cfg.type === "image") {
            return (
                <ImageUpload
                    value={field.value === 'file-pending' ? pendingFiles[cfg.name] : field.value}
                    onChange={(fileOrUrl) => handleFileChange(cfg.name, fileOrUrl)}
                    onError={(error) => toast.error(`Image error: ${error}`)}
                    disabled={isSubmitting || isUploadingFiles}
                    uploadMode="delayed"
                />
            );
        }

        if (cfg.type === "s3-image") {
            return (
                <S3ImageUpload
                    value={field.value === 'file-pending' ? pendingFiles[cfg.name] : field.value}
                    onChange={(fileOrUrl) => handleFileChange(cfg.name, fileOrUrl)} // ✅ Now matches
                    onError={(error) => toast.error('S3 Image error: ' + error)}
                    disabled={isSubmitting || isUploadingFiles}
                />
            );
        }

        if (cfg.type === "select") {
            return (
                <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    disabled={isSubmitting || isUploadingFiles}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={`Select ${cfg.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {cfg.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (cfg.type === "number") {
            const value = field.value ?? "";
            return (
                <Input
                    type="number"
                    placeholder={cfg.placeholder || `Enter ${cfg.label}`}
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? "" : Number(v));
                    }}
                    disabled={isSubmitting || isUploadingFiles}
                />
            );
        }

        if (cfg.type === "date") {
            const v = field.value;
            const toYMD = (d: Date) =>
                new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
            const value = v instanceof Date ? toYMD(v) : typeof v === "string" ? v : "";

            return (
                <Input
                    type="date"
                    placeholder={cfg.placeholder || `Enter ${cfg.label}`}
                    value={value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isSubmitting || isUploadingFiles}
                />
            );
        }

        // text (default)
        return (
            <Input
                type={cfg.type}
                placeholder={cfg.placeholder || `Enter ${cfg.label}`}
                {...field}
                value={field.value ?? ""}
                disabled={isSubmitting || isUploadingFiles}
            />
        );
    };

    // Show pending files count
    const pendingCount = Object.keys(pendingFiles).length;
    const isFormDisabled = isSubmitting || isUploadingFiles;

    return (
        <Dialog open={open} onOpenChange={!isFormDisabled ? onOpenChange : () => { }}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-background flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">
                        {title}
                        {pendingCount > 0 && (
                            <span className="ml-2 text-sm font-normal text-yellow-600">
                                ({pendingCount} file{pendingCount === 1 ? '' : 's'} pending upload)
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>

                    {/* Upload Progress */}
                    {isUploadingFiles && (
                        <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">Uploading files...</p>
                            {Object.entries(uploadProgress).map(([fieldName, progress]) => (
                                <div key={fieldName} className="flex items-center space-x-2">
                                    <span className="text-xs text-blue-700 capitalize">{fieldName}:</span>
                                    <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${progress === -1 ? 'bg-red-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${Math.max(progress, 0)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-blue-700">
                                        {progress === -1 ? 'Error' : `${progress}%`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            {fields.map((cfg) => (
                                <FormField
                                    key={cfg.name}
                                    control={form.control}
                                    name={cfg.name as any}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{cfg.label}</FormLabel>
                                            <FormControl className={cfg.type === "image" || cfg.type === "s3-image" ? "" : "border-2 border-gray-300 rounded-xl"}>
                                                {renderInput(cfg, field)}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </form>
                    </Form>
                </div>

                <DialogFooter className="shrink-0 flex gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isFormDisabled}
                    >
                        Cancel
                        {/* {pendingCount > 0 && !isUploadingFiles && (
                            <span className="ml-1 text-xs">({pendingCount} pending)</span>
                        )} */}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isFormDisabled}
                        onClick={form.handleSubmit(handleSubmit)}
                    >
                        {isUploadingFiles ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Uploading...
                            </>
                        ) : isSubmitting ? (
                            "Saving..."
                        ) : (
                            <>
                                {submitLabel}
                                {/* {pendingCount > 0 && (
                                    <span className="ml-1 text-xs">& Upload {pendingCount}</span>
                                )} */}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}