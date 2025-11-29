// "use client";

// import { DataTable } from "@/components/table/data-table";
// import { columns, LocalProducts } from "./table/columns";
// import { useQuery } from "@tanstack/react-query";
// import { fetchLocalProduct, LocalProduct } from "@/apis/localProducts";
// import React, { useState } from "react";

// export const localProducKeys = {
//     all: ["local-products"] as const,
//     lists: () => [...localProducKeys.all, "list"] as const,
//     list: (filters: Record<string, any>) => [...localProducKeys.lists(), { filters }] as const,
//     details: () => [...localProducKeys.all, "detail"] as const,
//     detail: (id: string) => [...localProducKeys.details(), id] as const,
// }

// export const useLocalProducts = () => {
//     return useQuery({
//         queryKey: localProducKeys.list({}),
//         queryFn: fetchLocalProduct,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//         retry: 2,
//         retryDelay: 1000,
//     })
// }


// export default function LocalProductPage(): React.ReactElement {

//     // Fetch products using TanStack Query
//     const { data: localProduct = [], isLoading, isError, error } = useLocalProducts();

//     return (
//         <div>
//             <div>
//                 <h1>Local Products</h1>
//                 <p>Manage your local Product Storage from here.</p>
//             </div>
//             <DataTable 
//                 columns={columns}
//                 data={localProduct}
//             />
//         </div>
//     )
// }
// src/pages/local-products/LocalProductPage.tsx
"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { columns, LocalProduct } from "./table/columns"; // make sure columns expect LocalProduct
import { useLocalProductsPaginated, useDeleteLocalProduct } from "@/hooks/useBackendLocalProducts";
import { PaginationState } from "@tanstack/react-table"
// import type { LocalProduct } from "@/apis/localProducts";
import LocalProductView from "../lcoalProduct/form/productView";
import { AddLocalProductForm } from "./form/addLocalProduct";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LocalProductPage(): React.ReactElement {
    const [selectedData, setSelectedData] = useState<LocalProduct | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<LocalProduct | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<LocalProduct | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [search] = useState('');

    const debouncedSearch = search;
    const deleteProductMutation = useDeleteLocalProduct();

    const { data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching
    } = useLocalProductsPaginated(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearch
    );

    // Always provide a typed fallback (empty array)
    // const rows: LocalProduct[] = data ?? [];

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
    };

    const handleViewData = (product: LocalProduct) => {
        setSelectedData(product);
        setIsViewOpen(true);
    };
    const handleCloseView = () => {
        setIsViewOpen(false);
        setSelectedData(null);
    };

    const handleAddProduct = () => {
        setIsAddFormOpen(true);
    }

    const handleEditProduct = (product: LocalProduct) => {
        setProductToEdit(product);
        setIsEditFormOpen(true);
    }

    const handleDeleteProduct = (product: LocalProduct) => {
        setProductToDelete(product);
        setDialogOpen(true);
    }

    const confirmDelete = () => {
        if (productToDelete) {
            deleteProductMutation.mutate(productToDelete.id, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setProductToDelete(null);
                    refetch(); // Refresh the list
                },
                onError: (error) => {
                    console.error('Delete failed:', error);
                }
            });
        }
    }

    const cancelDelete = () => {
        setDialogOpen(false);
        setProductToDelete(null);
    }


    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Local Products</h1>
                <p className="text-muted-foreground">Loading products…</p>
                {/* Optionally a skeleton for your table here */}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Local Products</h1>
                <p className="text-red-600">
                    {(error as Error)?.message ?? "Failed to load products."}
                </p>
                <button onClick={() => refetch()} className="mt-2 underline">
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-3">
            <div>
                <h1 className="text-2xl font-semibold">Local Products</h1>
                <p className="text-muted-foreground">
                    Manage your local product storage from here. {isFetching ? " (Refreshing…)" : ""}
                </p>
            </div>

            <DataTable
                columns={columns}
                data={data?.data || []}
                filterColumn="title"
                dropdownColumn="category"
                dropdownOptions={["Beauty", "Fragrance", "Furniture", "Groceries"]}
                onAdd={handleAddProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onView={handleViewData}
                manualPagination={true}
                pagination={pagination}
                pageCount={data?.pagination?.totalPages ?? -1}
                onPaginationChange={handlePaginationChange}
                totalRows={data?.pagination?.totalProducts ?? 0}
                isLoading={isLoading || isFetching}
            />

            {selectedData && isViewOpen && (
                <LocalProductView
                    product={selectedData}
                    isOpen={isViewOpen}
                    onClose={handleCloseView}
                />
            )}

            {isAddFormOpen && (
                <AddLocalProductForm
                    open={isAddFormOpen}
                    onOpenChange={setIsAddFormOpen}
                    product={null}
                />
            )}

            {isEditFormOpen && productToEdit && (
                <AddLocalProductForm
                    open={isEditFormOpen}
                    onOpenChange={setIsEditFormOpen}
                    product={{ ...productToEdit, id: Number(productToEdit.id) }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
