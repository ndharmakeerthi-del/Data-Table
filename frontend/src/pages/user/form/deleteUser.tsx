import CustomAlertDialog from "@/components/customUi/customAlertDialog";
import { Button } from "@/components/ui/button";
import { useUsersStore } from "@/store/usersStore";
import { toast } from "sonner";

interface DeleteUserProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | undefined;
    onDelete?: () => void ;
    // onDelete: (userId: number) => void;
    onCancel: () => void;
}

export function DeleteUser({ isOpen, onClose, userId, onDelete, onCancel }: DeleteUserProps) {
    if (!userId) return null;

    const deleteUser = useUsersStore((state) => state.deleteUser);

    const userDelete = (userId: number) => {
        if (onDelete) {
            deleteUser(userId);
            toast.success("User deleted successfully");
            onClose();
        } else {
            toast.error("Failed to delete user");
        }
    }

    return (
        <>
            <CustomAlertDialog open={isOpen} onOpenChange={onClose}>
                <h2>Delete User</h2>
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                <Button onClick={userDelete.bind(null, userId)}>Delete</Button>
                <Button onClick={onCancel}>Cancel</Button>
            </CustomAlertDialog>
        </>
    )
}
