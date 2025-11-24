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
        const res = await axios.patch(`${API_URL}/usersStatus/${phone}`, {
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

export const createUserAdmin = async (data: {
    phone: string;
    name: string;
    email: string;
    password: string;
    status: number;
    role: string;
    gender: number;
    dob: string;
}): Promise<{ message: string, success: boolean }> => {
    try {
        const res = await axios.post(`${API_URL}/users`, data, {
            withCredentials: true
        });
        return res.data;
    } catch (error: any) {
        console.log("Lỗi createUserAdmin:", error);
        throw new Error(error.response?.data?.message || "Không thể tạo người dùng");
    }
};

export const updateUserAdmin = async (
    phone: string,
    data: {
        name: string;
        email: string;
        password: string;
        status: number;
        role: string;
        gender: number;
        dob: string;
    }
): Promise<{ message: string }> => {
    try {
        const res = await axios.patch(`${API_URL}/users/${phone}`, data, {
            withCredentials: true
        });

        return res.data;
    } catch (error: any) {
        console.log("Lỗi updateUserAdmin:", error);
        throw new Error(error.response?.data?.message || "Không thể cập nhật người dùng");
    }
};
