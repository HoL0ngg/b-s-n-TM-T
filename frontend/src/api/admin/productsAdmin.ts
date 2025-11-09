import axios from "axios";
import type { ProductTypeAdmin } from "../../types/admin/ProductTypeAdmin";


const API_URL = "http://localhost:5000/api/admin/productsAdmin";

export const fetchProductsByStatusAdmin = async (
    status: string,
    page: number,
    limit: number,
    searchTerm: string
): Promise<{ products: ProductTypeAdmin[], totalPages: number }> => {

    // Bỏ qua logic 'token' vì chưa làm đăng nhập admin

    const res = await axios.get(`${API_URL}/`, {
        params: {
            status: status === 'all' ? undefined : status,
            page,
            limit,
            search: searchTerm || undefined
        },
        // --- FIX: THÊM DÒNG NÀY ---
        // Bắt buộc phải có vì server đã bật "credentials: true" trong CORS
        withCredentials: true
        // ---------------------------

        // Gỡ bỏ 'headers' vì chưa cần 'Authorization'
    });
    return res.data;
}