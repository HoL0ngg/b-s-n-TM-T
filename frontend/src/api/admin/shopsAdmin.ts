import axios from "axios";
import type { ShopAdminType } from "../../types/ShopType";

const API_URL = "http://localhost:5000/api/admin/shopsAdmin";
export const fetchShopsByStatusAdmin = async (
    status: string,
    page: number,
    limit: number,
    searchTerm?: string
): Promise<{ shops: ShopAdminType[], totalPages: number }> => {
    // console.log("Gọi API với:", { status, page, limit, searchTerm });
    const res = await axios.get(`${API_URL}/shops`, {
        params: {
            status: status === 'all' ? 'all' : status,
            page,
            limit,
            search: searchTerm || undefined
        },
        withCredentials: true
    });
    return res.data;
}

export const updateShopStatusAdmin = async (
    shopId: number,
    status: number,
    reason?: string
): Promise<{ message: string }> => {
    try {
        const res = await axios.put(`${API_URL}/${shopId}`, {
            status,
            reason
        }, {
            withCredentials: true
        });
        return res.data;
    } catch (error: any) {
        console.log("Lỗi khi gọi API updateShopStatusAdmin:", error);
        throw new Error(
            error.response?.data?.message || "Không thể cập nhật trạng thái shop"
        );
    }

}
