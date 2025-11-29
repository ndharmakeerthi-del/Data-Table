"use client"


import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { ColumnDef } from "@tanstack/react-table"


export type UserDetails = {
    id: number
    firstName: string
    lastName: string
    gender: string
    email: string
    birthDate: string
    image?: string
    profileImage?: string
}



export const columns: ColumnDef<UserDetails>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex justify-center items-center">
                <Checkbox
                    className="h-4 w-4"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-center items-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
    },

    {
        accessorKey: "id",
        header: ({ column }) => {
            return <DataTableColumnHeader
                column={column}
                title="ID"
            />
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: "profileImage",
        header: "Profile Image",
        cell: ({ row }) => {
            const imageUrl = row.getValue('profileImage') as string;
            const firstName = row.getValue('firstName') as string;

            return (
                <div className="flex items-center justify-center">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={firstName}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs border-2 border-gray-200">
                            {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs border-2 border-gray-200 hidden">
                        {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "firstName",
        header: "First Name",
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
    },
    {
        accessorKey: "gender",
        header: ({ column }) => {
            return <DataTableColumnHeader
                column={column}
                title="Gender"
            />
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("gender")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "birthDate",
        header: "Date of Birth",
    },
]
