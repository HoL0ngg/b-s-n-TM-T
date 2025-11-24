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
    images: ProductImageType[];
    avg_rating: number;

    min_price: number;
    max_price: number;

    shop_cate_id?: number | null;

    reject_reason?: string | null;
    ban_reason?: string | null;
    
    original_price: number;
    sale_price: number | null;
    discount_percentage: number | null;
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
    attribute: string;
    value: string;
}
export interface ProductVariantType {
    id: number;
    stock: number;
    options: VariantOption[];
    image_url: string;

    // Giữ các trường của đồng đội (main)
    original_price: number;
    sale_price: number | null;
    discount_percentage: number | null;
    product_name?: string;
    options_string?: string;
}

export interface ProductResponseType {
    products: ProductType[];
    totalPages: number;
    brands?: BrandOfProductType[];
}
export interface BrandOfProductType {
    id: number;
    name: string;
}

// Giữ các interface mới của đồng đội (main)
export interface PromotionType {
    id: number;
    shop_id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    banner_url: string;
}

export interface UpdatePromoItemDto {
    product_variant_id: number;
    discount_value: number; // Đây là %
}

export interface PromotionItem {
    promotion_id: number;
    product_variant_id: number;
    discount_value: number;
    product_name: string;
    product_image: string;
    original_price: number;
    stock: number;
    options_string?: string;
}

export interface CreatePromotionData {
    name: string;
    start_date: string;
    end_date: string;
    banner_image: File; // Kiểu File
}