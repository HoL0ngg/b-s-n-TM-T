import pool from "../config/db";

import type { Shop } from "../models/shop.model";

export const getShopOnIdService = async (id: number): Promise<Shop> => {
    const [row] = await pool.query("select * from shops where id = ?", [id]) as [Shop[], any];
    return row[0] as Shop;
}