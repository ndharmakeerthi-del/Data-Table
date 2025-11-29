
import { ViewDetails } from "@/components/form/viewDetails";
import { UserDetails } from "../table/columns";




interface UserDetailsViewProps {
    user: UserDetails;
    isOpen: boolean;
    onClose: () => void;
}

const fieldLabels = {
    id: "User ID",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    gender: "Gender",
    birthDate: "Birth Date",
}



export default function UserDetailsView ({ user, isOpen, onClose } : UserDetailsViewProps) {
    if (!isOpen) return null;


    return (
        <ViewDetails title="User Details" isOpen={isOpen} onClose={onClose} data={user} fieldLabels={fieldLabels}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(user).map(([key, value]) => (
                    <div key={key} className="group">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {fieldLabels[key as keyof typeof fieldLabels] || key}
                        </label>
                        <div className="relative">
                            <div className="text-base font-semibold text-foreground bg-card border border-border rounded-lg p-3 px-4 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:border-ring">
                                {value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ViewDetails>
    )
}