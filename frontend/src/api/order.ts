import api from './api'; // <-- Import file config axios MỚI

/**
 * [Shop] Lấy danh sách đơn hàng liên quan đến Shop
 * API: GET /api/shop/orders
 * (Token được tự động đính kèm bởi 'api.ts')
 */
export const getShopOrders = async () => {
    const res = await api.get('/shop/orders');
    return res.data;
}

/**
 * [Shop] Cập nhật trạng thái của một đơn hàng
 * API: PUT /api/shop/orders/:orderId/status
 * (Token được tự động đính kèm bởi 'api.ts')
 */
export const updateShopOrderStatus = async (orderId: number, status: string) => {
    const res = await api.put(
        `/shop/orders/${orderId}/status`, 
        { status } // Body của request
    );
    return res.data;
}