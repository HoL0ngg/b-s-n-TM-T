import api from './api';

export const getShopOrders = async (status: string | null) => {
    const res = await api.get('/orders/shop/orders', {
        params: { status }
    });
    return res.data;
}

export const updateShopOrderStatus = async (orderId: number, status: string) => {
    const res = await api.put(
        `/orders/shop/${orderId}/status`,
        { status }
    );
    return res.data;
}

export const getShopOrderDetail = async (orderId: string) => {
    const res = await api.get(`/orders/shop/${orderId}`);
    return res.data;
}

export const apiGetAllOrders = async (page: number = 1,
    limit: number = 10,
    status: string = 'all',
    search: string = '') => {
    const res = await api.get('/orders', {
        params: {
            page,
            limit,
            status: status === 'all' ? undefined : status, // Nếu 'all' thì không gửi
            search: search || undefined // Nếu rỗng thì không gửi
        }
    });
    return res.data;
}

export const apiGetUserOrders = async (
    page: number = 1,
    limit: number = 10,
    status: string = 'all') => {
    const res = await api.get(`/orders/user`, {
        params: {
            page,
            limit,
            status: status === 'all' ? undefined : status, // Nếu 'all' thì không gửi
        }
    });

    return res.data;
}

export const apiGetOrderDetail = async (orderId: number) => {
    const res = await api.get(`/orders/${orderId}`);
    console.log(res.data);

    return res.data;
}