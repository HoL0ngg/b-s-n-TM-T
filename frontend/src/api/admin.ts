import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

export interface DashboardStats {
    range: { startDate: string; endDate: string };
    summary: {
        revenue: number;
        orders: number;
        new_users: number;
        new_shops: number;
    };
    topShops: {
        id: number;
        name: string;
        logo_url: string;
        total_revenue: number;
        total_orders: number;
    }[];
    topCustomers: {
        phone_number: string;
        full_name: string;
        avatar_url: string;
        total_spent: number;
        total_orders: number;
    }[];
    bestProducts: {
        id: number;
        name: string;
        base_price: number;
        image_url: string;
        shop_name: string;
        total_sold_quantity: number;
        total_revenue_generated: number;
    }[];
    revenueChart: {
        name: string;     // "Thg 1" hoặc "19/11"
        revenue: number;  // 15000000
        orders: number;   // 120
    }[];
    recentOrders: {
        order_id: number;
        created_at: string; // ISO Date string
        total: number;
        status: string;
        customer: string;
        customer_avatar?: string;
        shop_name: string;
    }[];
}

export const loginAdmin = async (sdt: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { sdt, password });
    return response.data;
}

export const apiGetDashboardStats = async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    // Tạo query params
    const params = { startDate, endDate };

    const res = await axios.get(`${API_URL}/stats`, { params });
    console.log(res.data);

    return res.data;
};