import pool from "../config/db";
import type { Shop, ShopCategories } from "../models/shop.model";

class shopService {
    getShopOnIdService = async (id: number): Promise<Shop> => {
        const [row] = await pool.query("select * from shops where id = ?", [id]) as [Shop[], any];
        return row[0] as Shop;
    }

    getShopCateOnIdService = async (id: number, type: string): Promise<ShopCategories[]> => {
        const [row] = await pool.query("select id, name from shop_categories where shop_id = ?", [id]) as [ShopCategories[], any];
        return row as ShopCategories[];
    }

    // ← THÊM FUNCTION NÀY
    getShopByOwnerService = async (ownerId: string): Promise<Shop | null> => {
        const [rows] = await pool.query(
            "SELECT * FROM shops WHERE owner_id = ?", 
            [ownerId]
        ) as [Shop[], any];
        return rows[0] || null;
    }
}

export default new shopService();