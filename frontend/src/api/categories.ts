// src/api/categories.api.ts
import axios from "axios";
import type { CategoryType, SubCategoryType } from "../types/CategoryType";

const API_URl = "http://localhost:5000/api/categories";

export const fetchCategories = async (): Promise<CategoryType[]> => {
    const res = await axios.get(`${API_URl}`);
    return res.data;
};
export const fetchSubCategories = async (category_id: number): Promise<SubCategoryType[]> => {
    const res = await axios.get(`${API_URl}/subCategories/${category_id}`);
    return res.data;
}
