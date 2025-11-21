export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export interface OrderAdmin {
    order_id: number;
    user_id: string;
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