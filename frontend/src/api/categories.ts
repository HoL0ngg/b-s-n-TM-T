// src/api/categories.api.ts
import axios from "axios";
import type { CategoryType } from "../types/CategoryType";

const API_URl = "http://localhost:5000/api/categories";

export const fetchCategories = async (): Promise<CategoryType[]> => {
    const res = await axios.get(`${API_URl}`);
    return res.data;
};
