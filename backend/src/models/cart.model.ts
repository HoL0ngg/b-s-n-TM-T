import { RowDataPacket } from "mysql2";

export interface IVariantOption {
    attribute: string;
    value: string;
}

export interface CartItem extends RowDataPacket {
    product_id: number;
    product_variant_id: number;
    quantity: number;
    product_price: number;
    product_name: string;

    options?: IVariantOption[]; // <-- Sẽ được thêm vào

    original_price: number; // Giá gốc (pv.price)
    sale_price: number | null; // Giá đã giảm (nếu có)
    discount_percentage: number | null; // % giảm (nếu có)
}

// Kiểu dữ liệu trả về từ Query 2
export interface OptionRow extends RowDataPacket {
    variant_id: number;
    attribute: string;
    value: string;
}