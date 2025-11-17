import { PoolConnection } from 'mysql2/promise';
import { User } from "./user.model";
import db from '../config/db';

export interface Product {
    id: string;
    name: string;
    description: string;
    status: number;
    base_price: number;
    category_id: number;
    category_name: string;
    shop_id: number;
    product_variants: ProductVariant[];
    avg_rating: number;

    original_price: number;
    sale_price: number | null;
    discount_percentage: number | null;
}

export interface ProductImage {
    image_id: number;
    image_url: string;
    is_main: boolean; // (Hoặc 0 | 1)
}

export interface VariantOption {
    variant_id: number;
    attribute: string; // "Màu sắc"
    value: string;     // "Cam"
}

// 2. Kiểu cho một Biến thể
export interface ProductVariant {
    id: number;           // 1, 2, 3...
    stock: number;        // 40
    options: VariantOption[]; // [{ attribute: "Màu sắc", value: "Cam" }, { attribute: "Dung tích", value: "4ML" }]
    image_url: string;

    original_price: number; // <-- Đổi 'price' thành 'original_price'
    sale_price: number | null; // <-- Thêm giá sale (có thể null)
    discount_percentage: number | null; // <-- Thêm % (có thể null)
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
export interface BrandOfProduct {
    id: number;
    name: string;
}
export interface ProductResponse {
    products: Product[];
    totalPages: number;
    brands?: BrandOfProduct[];
}

/**
 * Cập nhật (giảm) số lượng tồn kho của một biến thể sản phẩm.
 * Hàm này được thiết kế để chạy BÊN TRONG một Transaction.
 * @param {PoolConnection} connection - Đối tượng kết nối Transaction.
 * @param {number} variantId - ID của biến thể sản phẩm.
 * @param {number} quantityBought - Số lượng đã mua (cần trừ đi).
 */
export const updateStockQuantity = async (connection: PoolConnection, variantId: number, quantityBought: number) => {
    await connection.execute(
        `UPDATE productvariants 
         SET stock_quantity = stock_quantity - ? 
         WHERE variant_id = ?`,
        [quantityBought, variantId]
    );
};
export interface UpdatePromoItemDto {
    product_variant_id: number;
    discount_value: number;
}

export interface CreatePromotionData {
    name: string;
    start_date: string;
    end_date: string;
    banner_url: string; // Kiểu File
    shop_id: string;
}
