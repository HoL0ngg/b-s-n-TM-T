import { User } from "./user.model";

export interface Product {
    id: string;
    name: string;
    description: string;
    status: number;
    base_price: number;
    category_id: number;
    shop_id: number;
    product_variants: ProductVariant[];
}

export interface VariantOption {
    variant_id: number;
    attribute: string; // "Màu sắc"
    value: string;     // "Cam"
}

// 2. Kiểu cho một Biến thể
export interface ProductVariant {
    id: number;           // 1, 2, 3...
    price: number;        // 223000
    stock: number;        // 40
    options: VariantOption[]; // [{ attribute: "Màu sắc", value: "Cam" }, { attribute: "Dung tích", value: "4ML" }]
}

export interface ProductReview {
    id: number;
    rating: number;
    comment: number;
    created_at: string;
    phone_number: string;
    email: string;
    avatar_url: string;
}

export interface ProductDetails {
    id: number,
    product_id: number,
    attribute: string,
    value: string,
}

export interface AttributeOfProductVariants {
    attribute: string,
    values: string[],
}
