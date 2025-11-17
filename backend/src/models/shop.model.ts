import db from '../config/db';
import { RowDataPacket } from 'mysql2/promise';

export interface Shop {
    id: Number;
    name: String;
    logo_url: String;
    description: String;
    status: Number;
    created_at: String;
    totalProduct: number;
    avgRating: number;
}

export interface ShopCategories {
    id: Number;
    name: String;
}

export const findShopIdByOwner = async (ownerPhone: string): Promise<number | null> => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT id FROM shops WHERE owner_id = ?`,
        [ownerPhone]
    );

    if (rows.length > 0) {
        return rows[0].id;
    }

    return null;
};

export interface ShopAdmin extends Shop {
    username: string;
    phone_number: string;
}

export interface ShopDetailAdmin extends ShopAdmin {
    productCount: number;
    totalRevenue: number;
    totalOrders: number;
}