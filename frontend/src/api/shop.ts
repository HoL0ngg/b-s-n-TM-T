import axios from "axios";
import type { ShopType, ShopCateType } from "../types/ShopType";

const API_URL = "http://localhost:5000/api/shops";

export const fetchShop = async (id: number): Promise<ShopType> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

export const fetchCateByShopId = async (id: number): Promise<ShopCateType[]> => {
    const res = await axios.get(`${API_URL}/${id}?type=cate`)
    return res.data;
}