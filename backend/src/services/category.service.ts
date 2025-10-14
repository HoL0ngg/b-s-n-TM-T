import pool from "../config/db";
import { Category } from "../models/category.model";

export const getAllCategories = async (): Promise<Category[]> => {
    const [rows] = await pool.query("SELECT id,name, description, img_url FROM categories");
    return rows as Category[];
};
