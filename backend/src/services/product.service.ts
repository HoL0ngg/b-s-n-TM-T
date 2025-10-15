import pool from "../config/db";
import { Product } from "../models/product.model";

export const getProductOnCategoryIdService = async (Category_id: number): Promise<Product[]> => {
    const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url FROM products JOIN productimages on productimages.product_id = products.id where category_id = ? Group by id", [Category_id]);
    return rows as Product[];
};

export const getProductOnIdService = async (id: number): Promise<Product> => {
    const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url FROM products JOIN productimages on productimages.product_id = products.id where products.id = ?", [id]) as [Product[], any];
    return rows[0] as Product;
}

export const getProductImgOnIdService = async (id: number): Promise<string[]> => {
    const [rows] = await pool.query("SELECT image_id, image_url FROM productimages where product_id = ?", [id]) as unknown as [string[], any];
    return rows;
}