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
    // ... (shop_id, shop_name, product_url, v.v...)
    options?: IVariantOption[]; // <-- Sẽ được thêm vào
}

// Kiểu dữ liệu trả về từ Query 2
export interface OptionRow extends RowDataPacket {
    variant_id: number;
    attribute: string;
    value: string;
}