// frontend/src/api/shopCategory.ts
import axios from "axios";

// Kiểu dữ liệu khớp với backend/service
export interface ShopCategoryType {
    id: number;
    shop_id: number;
    name: string;
}

const API_URL = "http://localhost:5000/api/shop-categories";

// Token đã được set tự động bởi `setAuthToken` trong `AuthContext`

// GET /api/shop-categories/
export const fetchShopCategories = async (): Promise<ShopCategoryType[]> => {
    const res = await axios.get(API_URL);
    return res.data;
};

// POST /api/shop-categories/
export const createShopCategory = async (name: string): Promise<ShopCategoryType> => {
    const res = await axios.post(API_URL, { name });
    return res.data;
};

// PUT /api/shop-categories/:id
export const updateShopCategory = async (id: number, name: string): Promise<ShopCategoryType> => {
    const res = await axios.put(`${API_URL}/${id}`, { name });
    return res.data;
};

// DELETE /api/shop-categories/:id
export const deleteShopCategory = async (id: number): Promise<any> => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};