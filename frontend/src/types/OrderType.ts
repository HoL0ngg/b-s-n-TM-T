export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

/**
 * Định nghĩa cấu trúc dữ liệu của một đơn hàng (Order)
 * (Phải khớp với những gì API Backend trả về)
 */
export interface OrderType {
    order_id: number;
    user_id: string; // SĐT của người mua
    order_date: string;
    total_amount: number;
    status: OrderStatus;
    payment_method: string;
    shipping_fee: number;
    payment_status: string;
    shop_name: string;
    avatar_url: string;
    customer_phone: string;
    custmer_email: string;
}

/**
 * Định nghĩa cấu trúc lỗi chung trả về từ API Backend
 */
export interface IApiError {
    message: string;
}

export interface OrderDetailType {
    id: number;
    order_date: string;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    payment_method: string;
    note: string;
    shipping_address: string;
    phone_number: string;

    // --- Thông tin Khách hàng ---
    customer_phone: string;
    customer_email: string;
    customer_avatar?: string;

    // --- Thông tin Shop ---
    shop_id: number;
    shop_name: string;
    shop_logo?: string;

    // --- Danh sách sản phẩm ---
    items: OrderDetailType[];
}

export interface OrderDetailType {
    order_id: number;

    product_id: number;
    product_name: string;
    image_url?: string;
    quantity: number;
    price_at_purchase: number;
    subtotal: number;
    options_string?: string; // Ví dụ: màu sắc, kích thước
}