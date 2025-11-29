"use client";

import { useEffect, useState } from "react";
import { z, ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type DefaultValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import Input from "@/components/customUi/customInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { S3ImageUpload } from "../ui/s3-image-upload";

// Field configuration interface
export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "password" | "image" | "s3-image";
    placeholder?: string;
    options?: string[]; // for select
}

// Props for AddForm
interface AddFormProps<T extends ZodSchema<any>> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schema: T;
    fields: FieldConfig[];
    onSubmit: (data: z.infer<T>, file?: File) => void | Promise<void>;
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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Let RHF use undefined unless caller supplies defaultValues
    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema) as any as undefined,
        defaultValues: defaultValues as DefaultValues<z.infer<T>> | undefined,
        mode: "onChange",
    });

    // Reset when defaults change (edit mode)
    useEffect(() => {
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            form.reset(defaultValues as any);
            setSelectedFile(null);
        }
    }, [defaultValues, form]);


    async function handleSubmit(values: z.infer<T>) {
        try {
            await onSubmit(values, selectedFile || undefined);
            toast.success(`${submitLabel} successful!`);
            form.reset();
            setSelectedFile(null);
            onOpenChange(false);
        } catch (err) {
            toast.error(`Failed to ${submitLabel.toLowerCase()}`);
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }

    // Helpers for type-specific input handling
    const renderInput = (cfg: FieldConfig, rf: any) => {

        if (cfg.type === "image") {
            return (
                <ImageUpload
                    value={rf.value || ""}
                    onChange={(url) => rf.onChange(url)}
                    onError={(error) => {
                        toast.error(`Image upload failed: ${error}`);
                    }}
                    disabled={isSubmitting}
                />
            );
        }

        if (cfg.type === "s3-image") {
            return (
                <S3ImageUpload 
                    value={defaultValues?.[cfg.name as keyof typeof defaultValues] as string}
                    onChange={(file) => {
                        setSelectedFile(file);
                        rf.onChange(file? 'file-selected' : '');
                    }}
                    onError={(error) => {
                        toast.error('Image upload error' + error);
                    }}
                    disabled={isSubmitting}
                />
            )
        }

        if (cfg.type === "select") {
            return (
                <Select
                    onValueChange={(v) => rf.onChange(v)}
                    value={rf.value ?? undefined} // undefined (not "") when empty
                    disabled={isSubmitting}
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
            // If your Zod uses z.coerce.number(), this can just pass strings.
            // If not, convert to number here:
            const value = rf.value ?? "";
            return (
                <Input
                    type="number"
                    placeholder={cfg.placeholder || `Enter ${cfg.label}`}
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        rf.onChange(v === "" ? "" : Number(v));
                    }}
                    disabled={isSubmitting}
                />
            );
        }

        if (cfg.type === "date") {
            // If schema uses z.coerce.date(), RHF value may be Date or string.
            // Normalize to a YYYY-MM-DD string for the input.
            const v = rf.value;
            const toYMD = (d: Date) =>
                new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
            const value =
                v instanceof Date ? toYMD(v) : typeof v === "string" ? v : "";

            return (
                <Input
                    type="date"
                    placeholder={cfg.placeholder || `Enter ${cfg.label}`}
                    value={value}
                    onChange={(e) => rf.onChange(e.target.value)}
                    disabled={isSubmitting}
                />
            );
        }

        // text (default)
        return (
            <Input
                type={cfg.type}
                placeholder={cfg.placeholder || `Enter ${cfg.label}`}
                {...rf}
                value={rf.value ?? ""} // allow empty
                disabled={isSubmitting}
            />
        );


    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-background flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
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
                                            <FormControl className={cfg.type === "image" || cfg.type === "s3-image"? "" : "border-2 border-gray-300 rounded-xl"}>
                                                {renderInput(cfg, field)}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))},
                            
                        </form>
                    </Form>
                </div>

                <DialogFooter className="shrink-0 flex gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        onClick={form.handleSubmit(handleSubmit)}
                    >
                        {isSubmitting ? "Saving..." : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}