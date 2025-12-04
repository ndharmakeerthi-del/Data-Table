import { AddUserSchema, AddUserFormData } from '@/schemas/index';
import { AddForm, FieldConfig } from '@/components/form/add-form';
import { UserDetails } from '../table/columns';
import { useCreateUser, useUpdateUser } from '@/hooks/useBackendUsers';

interface AddUserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserDetails | null;
}

const userFields: FieldConfig[] = [
    { name: "firstName", label: "First Name", type: "text", placeholder: "Enter first name" },
    { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter last name" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
    { name: "email", label: "Email", type: "text", placeholder: "Enter email" },
    { name: "birthDate", label: "Date of Birth", type: "date" },
    { name: "profileImage", label: "Profile Image", type: "s3-image" },
];

export function AddUserForm({ open, onOpenChange, user }: AddUserFormProps) {
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    async function handleSubmit(values: AddUserFormData, file?: File) {
        const birthDateStr = typeof values.birthDate === 'string'
            ? values.birthDate
            : values.birthDate instanceof Date
                ? values.birthDate.toISOString().split('T')[0]
                : String(values.birthDate);

        const userData = {
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender as "Male" | "Female",
            email: values.email,
            birthDate: birthDateStr,
        }

        if (!user) {
            createUserMutation.mutate({ userData, file }, {
                onSuccess: () => {
                    onOpenChange(false);
                }
            });
        } else {
            updateUserMutation.mutate({
                id: user.id,
                userData,
                file
            }, {
                onSuccess: () => {
                    onOpenChange(false);
                }
            })
        }
    }

    const defaultValues: Partial<AddUserFormData> | undefined = user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender as AddUserFormData['gender'],
            email: user.email,
            birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
            profileImage: user.profileImage || user.image,
        }
        : undefined;

    return (
        <AddForm
            open={open}
            onOpenChange={onOpenChange}
            schema={AddUserSchema}
            fields={userFields}
            onSubmit={handleSubmit}
            submitLabel={user ? "Update User" : "Add User"}
            title={user ? "Update User" : "Add User"}
            description="Fill in user details below"
            defaultValues={defaultValues}
        />
    );
}