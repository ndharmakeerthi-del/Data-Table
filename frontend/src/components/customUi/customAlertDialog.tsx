import * as React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "../ui/alert-dialog";
import { Button } from "@/components/ui/button"; // shadcn button (recommended)

interface AlertDialogProps extends React.ComponentProps<typeof AlertDialog> {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    titleClassName?: string;
    descriptionClassName?: string;
    confirmClassName?: string;
    cancelClassName?: string;
    className?: string;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
}

const CustomAlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
    (
        {
            title,
            description,
            confirmText = "Confirm",
            cancelText = "Cancel",
            titleClassName,
            descriptionClassName,
            confirmClassName,
            cancelClassName,
            onConfirm,
            onCancel,
            ...props
        },
        ref
    ) => (
        <AlertDialog // controlled via props.open/onOpenChange from parent
            // @ts-ignore
            ref={ref}
            {...props}
        >
            <AlertDialogContent
                className={props.className}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className={titleClassName}>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription className={descriptionClassName}>
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                <AlertDialogFooter>
                    {/* Use asChild so we fully control the button click */}
                    <AlertDialogCancel asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cancelClassName}
                            // Use capture to ensure we run before Radix closes/unmounts
                            onClickCapture={() => onCancel?.()}
                        >
                            {cancelText}
                        </Button>
                    </AlertDialogCancel>

                    <AlertDialogAction
                        className={confirmClassName}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
);

CustomAlertDialog.displayName = "CustomAlertDialog";
export default CustomAlertDialog;
