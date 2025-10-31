export interface ProductType {
    id: number;
    name: string;
    description: string;
    status: number;
    base_price: number;
    category_name: string;
    shop_id: number;
    image_url: string;
    sold_count: number;
    product_variants: ProductVariantType[];
    images: string[];
}

export interface ProductImageType {
    image_id: number;
    image_url: string;
    is_main: number;
}

export interface ProductReviewType {
    id: number;
    rating: number;
    comment: number;
    created_at: string;
    phone_number: string;
    email: string;
    avatar_url: string;
}

export interface ProductReviewSummaryType {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    total: number;
    avg: number;
}

export interface ProductDetailsType {
    id: number,
    product_id: number,
    attribute: string,
    value: string,
}
export interface AttributeOfProductVariantsType {
    attribute: string,
    values: string[],
}

interface VariantOption {
    attribute: string; // "Màu sắc"
    value: string;     // "Cam"
}

export interface ProductVariantType {
    id: number;           // 1, 2, 3...
    price: number;        // 223000
    stock: number;        // 40
    options: VariantOption[]; // [{ attribute: "Màu sắc", value: "Cam" }, { attribute: "Dung tích", value: "4ML" }]
}