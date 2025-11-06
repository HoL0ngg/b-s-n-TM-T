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
    attribute: string; // "Màu sắc"
    value: string;     // "Cam"
}

export interface ProductVariantType {
    id: number;           // 1, 2, 3...
    stock: number;        // 40
    options: VariantOption[]; // [{ attribute: "Màu sắc", value: "Cam" }, { attribute: "Dung tích", value: "4ML" }]
    image_url: string;

    original_price: number;
    sale_price: number | null;
    discount_percentage: number | null;
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

export interface PromotionType {
    id: number;
    shop_id: number;
    name: string;
    start_date: string; // Dùng 'string' vì JSON trả về từ API (ISO 8601)
    end_date: string;   // Dùng 'string'
    is_active: boolean;
}

export interface UpdatePromoItemDto {
    product_variant_id: number;
    discount_value: number; // Đây là %
}

export interface PromotionItem {
    // --- Từ bảng 'promotion_items' ---
    promotion_id: number;
    product_variant_id: number;
    discount_value: number;

    // --- Lấy từ JOIN (để hiển thị UI) ---
    product_name: string;
    product_image: string; // URL ảnh
    original_price: number; // Giá gốc của biến thể
    stock: number; // Tồn kho hiện tại
}