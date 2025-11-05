export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

/**
 * Định nghĩa cấu trúc dữ liệu của một đơn hàng (Order)
 * (Phải khớp với những gì API Backend trả về)
 */
export interface IOrder {
    order_id: number;
    user_id: string; // SĐT của người mua
    order_date: string; // Dạng chuỗi ISO
    total_amount: number;
    status: OrderStatus;
    payment_method: string;
}

/**
 * Định nghĩa cấu trúc lỗi chung trả về từ API Backend
 */
export interface IApiError {
    message: string;
}