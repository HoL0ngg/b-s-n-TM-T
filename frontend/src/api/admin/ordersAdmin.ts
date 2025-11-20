import axios from "axios";
const API_URL = "http://localhost:5000/api/admin/ordersAdmin";

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