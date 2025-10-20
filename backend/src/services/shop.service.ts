import pool from "../config/db";

import type { Shop, ShopCategories } from "../models/shop.model";

export const getShopOnIdService = async (id: number): Promise<Shop> => {
    const [row] = await pool.query("select * from shops where id = ?", [id]) as [Shop[], any];
    return row[0] as Shop;
}

export const getShopCateOnIdService = async (id: number, type: string): Promise<ShopCategories[]> => {
    const [row] = await pool.query("select id, name from shop_categories where shop_id = ?", [id]) as [ShopCategories[], any];
    return row as ShopCategories[];
}