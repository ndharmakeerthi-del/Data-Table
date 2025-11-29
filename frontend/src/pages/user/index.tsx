"use client"

import React, { useState } from "react"
import { columns, UserDetails } from "./table/columns"
import { DataTable } from "@/components/table/data-table"
import UserDetailsView from "./form/userDetailsView"
import { AddUserForm } from "./form/userAdd"
import { toast } from "sonner"
import CustomAlertDialog from "@/components/customUi/customAlertDialog"
import { useUsersPaginated, useDeleteUser } from "@/hooks/useBackendUsers"
import { PaginationState } from "@tanstack/react-table"
import { useDebounce } from "@/hooks/useDebounce"
import { Input } from "@/components/ui/input"

export default function UserDetailsTable(): React.ReactElement {
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isAddFormOpen, setIsAddFormOpen] = useState(false)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<UserDetails | null>(null)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [userToDelete, setUserToDelete] = React.useState<UserDetails | null>(null)

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [search, setSearch] = useState('');

    const debouncedSearch = useDebounce(search, 300);
    const deleteUserMutation = useDeleteUser()

    const {
        data,
        isLoading,
        error,
        isFetching
    } = useUsersPaginated(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearch
    );

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
    };

    const handleViewUser = (user: UserDetails) => {
        setSelectedUser(user)
        setIsViewOpen(true)
    }

    const handleCloseView = () => {
        setIsViewOpen(false)
        setSelectedUser(null)
    }

    const handleAddUser = () => {
        setIsAddFormOpen(true)
    }

    const handleEditUser = (user: UserDetails) => {
        setUserToEdit(user)
        setIsEditFormOpen(true)
    }

    const handleDeleteUser = (user: UserDetails) => {
        setUserToDelete(user)
        setDialogOpen(true)
    }

    const confirmDeleteUser = () => {
        if (userToDelete) {
            deleteUserMutation.mutate(userToDelete.id)
            setDialogOpen(false)
            setUserToDelete(null)
        }
    }

    // Error state
    if (error && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-destructive">
                        Error loading users: {error?.message}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your user accounts and view user details.
                </p>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            
            <DataTable
                columns={columns}
                data={data?.data ?? []}
                // filterColumn="firstName"
                dropdownColumn="gender"
                dropdownOptions={["Male", "Female"]}
                onAdd={handleAddUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onView={handleViewUser}
                manualPagination={true}
                pagination={pagination}
                pageCount={data?.pagination?.totalPages ?? -1}
                onPaginationChange={handlePaginationChange}
                totalRows={data?.pagination?.totalUsers ?? 0}
                isLoading={isLoading || isFetching}
            />

            {selectedUser && isViewOpen && (
                <UserDetailsView
                    user={selectedUser}
                    isOpen={isViewOpen}
                    onClose={handleCloseView}
                />
            )}

            {isAddFormOpen && (
                <AddUserForm
                    open={isAddFormOpen}
                    onOpenChange={setIsAddFormOpen}
                    user={null}
                />
            )}

            {isEditFormOpen && (
                <AddUserForm
                    open={isEditFormOpen}
                    onOpenChange={setIsEditFormOpen}
                    user={userToEdit}
                />
            )}

            <CustomAlertDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                variant="destructive"
                title="Confirm Deletion"
                description={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => {
                    confirmDeleteUser()
                }}
                onCancel={() => {
                    toast.info("User deletion canceled", {
                        duration: 3000,
                        position: "top-center",
                    });
                }}
                className="w-2/5 shadow-sm shadow-black"
                confirmClassName="bg-red-600"
            />
        </div>
    )
}