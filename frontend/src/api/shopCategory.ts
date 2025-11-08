import axios from "axios";
import { getAuthHeaders } from "./apiHelpers"; // (Chúng ta sẽ tạo file này)

// NÂNG CẤP: Thêm product_count
export interface ShopCategoryType {
    id: number;
    shop_id: number;
    name: string;
    product_count: number;
}

const API_URL = "http://localhost:5000/api/shop-categories";

// Token sẽ được đính kèm tự động
export const fetchShopCategories = async (): Promise<ShopCategoryType[]> => {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data;
};

export const createShopCategory = async (name: string): Promise<ShopCategoryType> => {
    const res = await axios.post(API_URL, { name }, getAuthHeaders());
    return res.data;
};

export const updateShopCategory = async (id: number, name: string): Promise<ShopCategoryType> => {
    const res = await axios.put(`${API_URL}/${id}`, { name }, getAuthHeaders());
    return res.data;
};

export const deleteShopCategory = async (id: number): Promise<any> => {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return res.data;
};