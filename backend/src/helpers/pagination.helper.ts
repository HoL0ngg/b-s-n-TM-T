import pool from "../config/db";
import type { Product } from "../models/product.model";

export const paginationProducts = async (whereClause: string,
    params: any[],
    page: number = 1,
    limit: number = 12,
    orderBy: string = ""
): Promise<{ data: Product[]; totalPages: number }> => {
    const offset = (page - 1) * limit;
    const [countRows] = await pool.query(
        `SELECT COUNT(*) as total FROM products ${whereClause}`,
        params
    );
    const total = (countRows as any)[0].total;
    const totalPages = Math.ceil(total / limit);

    const [rows] = await pool.query(
        `SELECT 
        products.id, 
        products.name, 
        products.description, 
        products.base_price, 
        products.shop_id, 
        productimages.image_url, 
        products.sold_count
      FROM products 
      LEFT JOIN productimages 
          ON productimages.product_id = products.id 
          AND productimages.isMain = 1
      ${whereClause}
      GROUP BY products.id
      ${orderBy}
      LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return { data: rows as Product[], totalPages };
}