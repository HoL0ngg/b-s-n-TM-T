// backend/src/services/shopCategory.service.ts
import pool from "../config/db";
import { OkPacket, RowDataPacket } from "mysql2";

export interface ShopCategory {
    id: number;
    shop_id: number;
    name: string;
}

// Lấy tất cả danh mục của MỘT shop
export const getCategoriesByShopId = async (shopId: number): Promise<ShopCategory[]> => {
    const [rows] = await pool.query(
        "SELECT id, shop_id, name FROM shop_categories WHERE shop_id = ?",
        [shopId]
    );
    return rows as ShopCategory[];
};

// Lấy một danh mục (để kiểm tra quyền sở hữu)
export const getCategoryByIdAndShopId = async (id: number, shopId: number): Promise<ShopCategory | null> => {
    const [rows] = await pool.query(
        "SELECT * FROM shop_categories WHERE id = ? AND shop_id = ?",
        [id, shopId]
    );
    if (Array.isArray(rows) && rows.length > 0) {
        return (rows as ShopCategory[])[0];
    }
    return null;
}

// Tạo danh mục mới
export const createCategory = async (name: string, shopId: number): Promise<number> => {
    const [result] = await pool.query(
        "INSERT INTO shop_categories (name, shop_id) VALUES (?, ?)",
        [name, shopId]
    );
    return (result as OkPacket).insertId;
};

// Cập nhật danh mục
export const updateCategory = async (id: number, name: string): Promise<boolean> => {
    const [result] = await pool.query(
        "UPDATE shop_categories SET name = ? WHERE id = ?",
        [name, id]
    );
    return (result as OkPacket).affectedRows > 0;
};

// Xóa danh mục
export const deleteCategory = async (id: number): Promise<boolean> => {
    const [result] = await pool.query(
        "DELETE FROM shop_categories WHERE id = ?",
        [id]
    );
    return (result as OkPacket).affectedRows > 0;
};