import axios from "axios";
import type { ShopType, ShopCateType } from "../types/ShopType";

const API_URL = "http://localhost:5000/api/shops";

export const fetchShop = async (id: number): Promise<ShopType> => {
    const res = await axios.get(`${API_URL}/shop/${id}`);
    return res.data;
}

export const fetchCateByShopId = async (id: number): Promise<ShopCateType[]> => {
    const res = await axios.get(`${API_URL}/shop/${id}?type=cate`)
    return res.data;
}

export const apiGetFeaturedShops = async (): Promise<ShopType[]> => {
    const res = await axios.get(`${API_URL}/hot`);
    return res.data;
}

export const apiGetVariantsForShop = async (id: number) => {
    const res = await axios.get(`${API_URL}/variants/${id}`);
    return res.data;
}
export const fetchShopByOwnerId = async (ownerId: number): Promise<ShopType | null> => {
    try {
        const res = await axios.get(`${API_URL}/by-owner/${ownerId}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching shop by owner:', error);
        return null;
    }
}
export const apiCreateShop = async (
  payload: Pick<ShopType, "name" | "logo_url" | "description" | "status"> & { owner_id: string | number }
): Promise<number> => {
  const res = await axios.post(`${API_URL}`, payload);
  return res.data.shopId as number;
};

export const apiUpdateShop = async (
  id: number,
  payload: Partial<Pick<ShopType, "name" | "logo_url" | "description" | "status">>
): Promise<boolean> => {
  const res = await axios.put(`${API_URL}/${id}`, payload);
  return res.status === 200;
};

export const apiDeleteShop = async (id: number): Promise<boolean> => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.status === 200;
};