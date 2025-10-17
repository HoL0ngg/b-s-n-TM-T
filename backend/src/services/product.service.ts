import pool from "../config/db";
import { Product } from "../models/product.model";

export const getProductOnCategoryIdService = async (Category_id: number): Promise<Product[]> => {
    const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id where category_id = ? Group by id", [Category_id]);
    return rows as Product[];
};

export const getProductOnIdService = async (id: number): Promise<Product> => {
    const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id where products.id = ?", [id]) as [Product[], any];
    return rows[0] as Product;
}

export const getProductImgOnIdService = async (id: number): Promise<string[]> => {
    const [rows] = await pool.query("SELECT image_id, image_url FROM productimages where product_id = ?", [id]) as unknown as [string[], any];
    return rows;
}

export const get5ProductOnShopIdService = async (id: Number): Promise<Product[]> => {
    const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id where shop_id = ? Group by id limit 5", [id]);
    return rows as Product[];
}

export const getProductOnShopIdService = async (shopId: number, sort: string) => {
    let orderBy = "id DESC";

    if (sort === "popular") {
        orderBy = "(sold_count * 0.6 + IFNULL(AVG(rating), 0) * 0.4) DESC";
    } else if (sort === "hot") {
        orderBy = "sold_count DESC";
    } else if (sort === "new") {
        orderBy = "products.created_at DESC";
    }

    const [rows] = await pool.query(
        `SELECT products.id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id LEFT JOIN productreviews on productreviews.product_id = products.id WHERE products.shop_id = ? Group by products.id ORDER BY ${orderBy}`,
        [shopId]
    );
    return rows;
};