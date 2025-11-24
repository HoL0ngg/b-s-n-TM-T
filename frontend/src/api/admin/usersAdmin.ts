import axios from "axios";
import type { UserAdminType } from "../../types/admin/UserTypeAdmin";

const API_URL = `${process.env.VITE_API_URL}/api/admin/usersAdmin`;

export const fetchSellerByStatusAdmin = async (status: string, page: number, limit: number, searchTerm?: string): Promise<{ users: UserAdminType[], totalPages: number }> => {
    const res = await axios.get(`${API_URL}/users/sellers`, {
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
export const fetchBuyerByStatusAdmin = async (status: string, page: number, limit: number, searchTerm?: string): Promise<{ users: UserAdminType[], totalPages: number }> => {
    const res = await axios.get(`${API_URL}/users/buyers`, {
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

export const updateUserStatusAdmin = async (
    phone: string,
    status: number,
): Promise<{ message: string }> => {
    try {
        const res = await axios.patch(`${API_URL}/users/${phone}`, {
            status
        }, {
            withCredentials: true
        });
        return res.data;
    } catch (error: any) {
        console.log("Lỗi khi gọi API updateUserStatusAdmin:", error);
        throw new Error(
            error.response?.data?.message || "Không thể cập nhật trạng thái người dùng"
        );
    }
}