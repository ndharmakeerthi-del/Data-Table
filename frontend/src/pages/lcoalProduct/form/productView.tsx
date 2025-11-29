

import { LocalProduct } from "../table/columns";
import { ViewDetails } from "@/components/form/viewDetails";



interface LocalProductViewProps {
    product: LocalProduct;
    isOpen: boolean;
    onClose: () => void;
}


const fieldLabels = {
    id: "Product ID",
    image: "Product Image",
    title: "Title",
    category: "Category",
    price: "Price",
    discountPercentage: "Discount Percentage",
    rating: "Rating",
    stock: "Stock",
    brand: "Brand",
}

export default function LocalProductView({ product, isOpen, onClose }: LocalProductViewProps) {
    if (!isOpen) return null;

    const renderField = (key: string, value: any) => {
        if (key === 'image' && value) {
            return (
                <img
                    src={value}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded-lg border"
                />
            );
        }
        if (key === 'price') {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(value);
        }
        if (key === 'discountPercentage') {
            return `${value}%`;
        }
        return value;
    };

    return (
        <ViewDetails title="Product Details" isOpen={isOpen} onClose={onClose} data={product} fieldLabels={fieldLabels}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product).map(([key, value]) => (
                    <div key={key} className="group">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {fieldLabels[key as keyof typeof fieldLabels] || key}
                        </label>
                        <div className="relative">
                            <div className="text-base font-semibold text-foreground bg-card border border-border rounded-lg p-3 px-4 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:border-ring">
                                {renderField(key, value)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ViewDetails>
    )
}

// export default function LocalProductView({ product, isOpen, onClose }: LocalProductViewProps) {
//     // Add custom rendering for image field
//     const renderField = (key: string, value: any) => {
//         if (key === 'image' && value) {
//             return (
//                 <img
//                     src={value}
//                     alt="Product"
//                     className="w-32 h-32 object-cover rounded-lg border"
//                 />
//             );
//         }
//         if (key === 'price') {
//             return new Intl.NumberFormat("en-US", {
//                 style: "currency",
//                 currency: "USD",
//             }).format(value);
//         }
//         if (key === 'discountPercentage') {
//             return `${value}%`;
//         }
//         return value;
//     };

//     return (
//         <ViewDetails
//             data={product}
//             labels={fieldLabels}
//             isOpen={isOpen}
//             onClose={onClose}
//             title="Product Details"
//             renderField={renderField}
//         />
//     );
// }