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
    avg_rating: number
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
