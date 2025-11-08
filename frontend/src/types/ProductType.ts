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
    shop_cate_id?: number | null; // (Đã thêm)
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

// ===== SỬA LỖI: Đổi tên các trường để khớp với CSDL mới =====
// (File 'product_detail' cũ của bạn đã được thay bằng 'product_details')
export interface ProductDetailsType {
    id: number,
    product_id: number,
    attribute: string, // <-- Tên cũ là 'attribute'
    value: string,     // <-- Tên cũ là 'value'
}
// =======================================================

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
    price: number;    
    stock: number;    
    options: VariantOption[]; 
    image_url: string;
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