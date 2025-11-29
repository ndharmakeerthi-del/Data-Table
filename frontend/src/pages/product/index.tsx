"use client"
import { useState } from "react"
import { columns, Products } from "./table/columns"
import { DataTable } from "@/components/table/data-table"
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, Product } from "@/apis/products";
import ViewUser from "./form/viewProduct";



export default function DemoPage(): React.ReactElement {
    const [selectedData, setSelectedData] = useState<Products | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // Fetch products using TanStack Query
    const { data, isLoading, isError, error } = useQuery<Product[], Error>({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });


    const handleViewdata = (row: Products) => {
        setSelectedData(row)
        setIsViewOpen(true)
    }

    if (isLoading) {
        return <div className="container mx-auto py-10">Loading...</div>
    }

    if (isError) {
        return <div className="container mx-auto py-10 text-red-500">
            Error: {error?.message}
        </div>
    }
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your product inventory and view product details.
                </p>
            </div>
            
            <DataTable
                columns={columns}
                data={data?.map(p => ({ ...p, id: String(p.id) })) || []}
                filterColumn="title"
                dropdownColumn="category"
                dropdownOptions={["Beauty", "Fragrance", "Furniture", "Groceries"]}
                onView={handleViewdata}
            />

            {selectedData && (
                <ViewUser
                    isOpen={isViewOpen}
                    onClose={() => setIsViewOpen(false)}
                    data={selectedData}
                />
            )}
        </div>
    )
}