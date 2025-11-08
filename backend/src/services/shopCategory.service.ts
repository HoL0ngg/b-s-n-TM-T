import pool from "../config/db";
import { OkPacket, RowDataPacket } from "mysql2";

// NÂNG CẤP: Thêm product_count
export interface ShopCategory {
    id: number;
    shop_id: number;
    name: string;
    product_count: number; 
}

// Lấy tất cả danh mục của MỘT shop
export const getCategoriesByShopId = async (shopId: number): Promise<ShopCategory[]> => {
    // NÂNG CẤP: Dùng LEFT JOIN, COUNT và GROUP BY để đếm số sản phẩm
    const query = `
        SELECT 
            sc.id, 
            sc.shop_id, 
            sc.name, 
            COUNT(p.id) AS product_count
        FROM shop_categories sc
        LEFT JOIN products p ON sc.id = p.shop_cate_id AND p.shop_id = ?
        WHERE sc.shop_id = ?
        GROUP BY sc.id, sc.shop_id, sc.name
        ORDER BY sc.name ASC
    `;
    const [rows] = await pool.query(query, [shopId, shopId]);
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