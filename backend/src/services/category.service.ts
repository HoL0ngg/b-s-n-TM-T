import pool from "../config/db";
import { Category, SubCategory } from "../models/category.model";

class categoryService {
    getAllCategoriesService = async (): Promise<Category[]> => {
        const [rows] = await pool.query("SELECT id, name, description, img_url FROM categories");
        return rows as Category[];
    };

    getSubCategoryService = async (category_id: number): Promise<SubCategory[]> => {
        const [rows] = await pool.query("SELECT id,name FROM generic WHERE category_id = ?", [category_id]);
        return rows as SubCategory[];
    }
}
export default new categoryService();
