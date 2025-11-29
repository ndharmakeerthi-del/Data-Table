import { ViewDetails } from "@/components/form/viewDetails";
import { Products } from "../table/columns";















interface ViewRowDataProps {
    data: Products;
    isOpen: boolean;
    onClose: () => void;
}

const fieldLabels = {
    id: "Product ID",
    title: "Title",
    category: "Category",
    price: "Price",
    discountPercentage: "Discount Percentage",
    rating: "Rating",
    stock: "Stock",
    brand: "Brand",
}


export default function ViewProduct({ data, isOpen, onClose }: ViewRowDataProps) {

    if (!isOpen) return null;

    return (
        <ViewDetails title="Product Details" isOpen={isOpen} onClose={onClose} data={data} fieldLabels={fieldLabels}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="group">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {fieldLabels[key as keyof typeof fieldLabels] || key}
                        </label>
                        <div className="relative">
                            <div className="text-base font-semibold text-foreground bg-card border border-border rounded-lg p-3 px-4 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:border-ring">
                                {key === 'price' ? `$${value}` : value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ViewDetails>
    )
}