import { LocalProduct } from "@/pages/lcoalProduct/table/columns";
import { AddForm, FieldConfig } from "@/components/form/add-form";
import { useCreateLocalProduct, useUpdateLocalProduct } from "@/hooks/useBackendLocalProducts";
import { AddLocalProductFormData } from "@/schemas";
import { AddLocalProductSchema } from "@/schemas";




interface AddProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: LocalProduct | null;
}

const localProductFields: FieldConfig[] = [
    { name: "image", label: "Product Image", type: "image" },
    { name: "title", label: "Title", type: "text", placeholder: "Enter product title" },
    { name: "category", label: "Category", type: "text", placeholder: "Enter product category" },
    { name: "brand", label: "Brand", type: "text", placeholder: "Enter product brand" },
    { name: "price", label: "Price", type: "number", placeholder: "Enter product price" },
    { name: "discountPercentage", label: "Discount Percentage", type: "number", placeholder: "Enter product discount percentage" },
    { name: "rating", label: "Rating", type: "number", placeholder: "Enter product rating" },
    { name: "stock", label: "Stock", type: "number", placeholder: "Enter product stock" },
]

export function AddLocalProductForm({ open, onOpenChange, product }: AddProductFormProps) {
    const createProductMutation = useCreateLocalProduct();
    const updateProductMutation = useUpdateLocalProduct();

    async function handleSubmit(values: AddLocalProductFormData) {
        if (!product) {
            // Creating new product
            const newProductData = {
                title: values.title,
                category: values.category,
                price: values.price,
                discountPercentage: values.discountPercentage,
                rating: values.rating,
                stock: values.stock,
                brand: values.brand,
                image: values.image || "" // Include image
            };

            createProductMutation.mutate(newProductData, {
                onSuccess: () => {
                    onOpenChange(false);
                }
            });
        }

        else {
            // Updating existing product
            const updatedProductData = {
                title: values.title,
                category: values.category,
                price: values.price,
                discountPercentage: values.discountPercentage,
                rating: values.rating,
                stock: values.stock,
                brand: values.brand,
                image: values.image || "" // Include image
            };

            updateProductMutation.mutate(
                { id: Number(product.id), updatedData: updatedProductData },
                {
                    onSuccess: () => {
                        onOpenChange(false);
                    }
                }
            )
        }
    }

    const defaultValues: Partial<AddLocalProductFormData> | undefined = product
        ? {
            title: product.title,
            category: product.category,
            price: product.price,
            discountPercentage: product.discountPercentage,
            rating: product.rating,
            stock: product.stock,
            brand: product.brand,
            image: product.image || "" // Include image
        }
        : undefined;

    return (
        <>
            <AddForm
                open={open}
                onOpenChange={onOpenChange}
                schema={AddLocalProductSchema}
                fields={localProductFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                title={product ? "Edit Product" : "Add Product"}
                submitLabel={product ? "Update Product" : "Add Product"}
                description="Add or edit a product to your local storage."
                
            />
            {/* <UploadWidget /> */}
        </>
    )

}