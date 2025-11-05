import api from './api'; 

export const getShopOrders = async (status: string | null) => {
    const res = await api.get('/shop/orders', {
        params: { status } 
    });
    return res.data;
}

export const updateShopOrderStatus = async (orderId: number, status: string) => {
    const res = await api.put(
        `/shop/orders/${orderId}/status`, 
        { status }
    );
    return res.data;
}

export const getShopOrderDetail = async (orderId: string) => {
    const res = await api.get(`/shop/orders/${orderId}`);
    return res.data;
}