export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface IOrder {
    order_id: number;
    user_id: string;
    order_date: string;
    total_amount: number;
    status: OrderStatus;
    payment_method: string;
    shipping_fee: number;
    payment_status: string;
}

export interface IApiError {
    message: string;
}