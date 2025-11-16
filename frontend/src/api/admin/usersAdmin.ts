import axios from "axios";
import type { UserAdminType } from "../../types/admin/UserTypeAdmin";

const API_URL = "http://localhost:5000/api/admin/usersAdmin";

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