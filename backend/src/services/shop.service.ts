import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import type { Shop, ShopCategories } from "../models/shop.model";

class shopService {
    getShopOnIdService = async (id: number): Promise<Shop> => {
        const [row] = await pool.query(`
               SELECT 
                    shops.*,
                    
                    -- Truy vấn con 1: Đếm tổng số sản phẩm
                    (SELECT COUNT(*) 
                    FROM products 
                    WHERE products.shop_id = shops.id) AS totalProduct,
                    
                    -- Truy vấn con 2: Tính rating trung bình của tất cả review
                    (SELECT IFNULL(AVG(productreviews.rating), 0) 
                    FROM productreviews
                    JOIN products ON productreviews.product_id = products.id
                    WHERE products.shop_id = shops.id) AS avgRating
                    
                FROM 
                    shops
                WHERE 
                    shops.id = ?;`
            , [id]) as [Shop[], any];
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
    getHotShops = async () => {
        const [row] = await pool.query(`
               SELECT 
                    shops.*,
                    
                    -- Truy vấn con 1: Đếm tổng số sản phẩm
                    (SELECT COUNT(*) 
                    FROM products 
                    WHERE products.shop_id = shops.id) AS totalProduct,
                    
                    -- Truy vấn con 2: Tính rating trung bình của tất cả review
                    (SELECT IFNULL(AVG(productreviews.rating), 0) 
                    FROM productreviews
                    JOIN products ON productreviews.product_id = products.id
                    WHERE products.shop_id = shops.id) AS avgRating
                    
                FROM 
                    shops
                ORDER BY
                    RAND()`
        ) as [Shop[], any];
        return row as Shop[];
    }

    getAllVariantsByShopId = async (shopId: number) => {
        const sql = `
            SELECT 
                pv.id,
                pv.price AS original_price, -- Giá gốc của biến thể
                pv.stock,
                pv.sku,
                p.name AS product_name,    
                
                COALESCE(NULLIF(pv.image_url, ''), (
                    SELECT pi.image_url 
                    FROM productimages pi 
                    WHERE pi.product_id = p.id AND pi.is_main = 1 
                    LIMIT 1
                )) AS image_url,
                
                -- Tạo chuỗi options (ví dụ: "Màu sắc: Đỏ, Kích thước: M")
                (
                    SELECT GROUP_CONCAT(CONCAT(pa.name, ': ', vov.value) SEPARATOR ', ')
                    FROM variantoptionvalues vov
                    JOIN product_attributes pa ON vov.attribute_id = pa.id
                    WHERE vov.variant_id = pv.id
                ) AS options_string

            FROM 
                productvariants pv
            JOIN 
                products p ON pv.product_id = p.id
            WHERE 
                p.shop_id = ?
            ORDER BY
                p.created_at DESC, pv.id ASC; -- Sắp xếp sản phẩm mới nhất lên đầu
        `;

        const [rows] = await pool.query<RowDataPacket[]>(sql, [shopId]);
        return rows;
    }
}

export default new shopService();