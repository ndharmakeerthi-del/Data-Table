import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { getThumbnailUrl } from "@/utils/upload";







export type LocalProduct = {
    id: number;
    title: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    image?: string;
}


export const columns: ColumnDef<LocalProduct>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <>
                <Checkbox
                    className="h-4 w-4"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </>
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },

    {
        accessorKey: "id",
        header: ({ column }) => {
            return (
                <Button variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    ID
                    <ArrowUpDown />
                </Button>
            )
        }
    },

    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const imageUrl = row.getValue("image") as string;
            const productTitle = row.getValue("title") as string;
            
            return (
                <div className="flex items-center justify-center">
                    {imageUrl ? (
                        <div className="relative h-12 w-12">
                            <img 
                                src={getThumbnailUrl(imageUrl)} 
                                alt={productTitle}
                                className="h-12 w-12 rounded-md object-cover border hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                        </div>
                    )}
                </div>
            )
        }
    },

    {
        accessorKey: "title",
        header: "Title",
    },

    {
        accessorKey: "category",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Category" />
        }
    },
    {
        accessorKey: "brand",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Brand" />
        }
    },

    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown />
                </Button>
            )
        }
    },

    {
        accessorKey: "discountPercentage",
        header: ({ column }) => {
            return (
                <Button variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Discount Percentage
                    <ArrowUpDown />
                </Button>
            )
        }
    },

    {
        accessorKey: "rating",
        header: "Rating",
    },

    {
        accessorKey: "stock",
        header: "Stock",
    }
]