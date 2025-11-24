import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/ordersAdmin`;

export const fetchAllOrders = async (shopId: number, page: number, limit: number) => {
    const res = await axios.get(`${API_URL}/ordersAdmin`, {
        params: {
            shopId,
            page,
            limit,
        }
    });
    return res.data;
}