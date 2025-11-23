export enum OrderStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    SHIPPING = 'Shipping',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
    RETURNS = 'Returns'
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED, OrderStatus.RETURNS], // Can return if shipping fails? Or maybe Cancelled is not allowed after shipping? Usually Cancelled is allowed before shipping.
    [OrderStatus.DELIVERED]: [OrderStatus.RETURNS],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.RETURNS]: []
};
