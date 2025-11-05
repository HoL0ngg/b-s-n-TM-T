import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Product, ProductReview, ProductDetails, AttributeOfProductVariants, BrandOfProduct, ProductVariant, VariantOption, ProductResponse, ProductImage } from "../models/product.model";
import { ResultSetHeader } from 'mysql2';
import { paginationProducts } from "../helpers/pagination.helper";

// =================================================================
// SỬA LỖI: Cập nhật View v_products_list
// Hãy chạy lệnh CREATE VIEW này trong phpMyAdmin của bạn 1 LẦN
// để cập nhật 'v_products_list'
// =================================================================
/*
DROP VIEW IF EXISTS `v_products_list`;
CREATE VIEW `v_products_list` AS 
SELECT 
    `p`.`id` AS `id`, 
    `p`.`name` AS `name`, 
    `p`.`description` AS `description`, 
    `p`.`base_price` AS `base_price`, 
    `p`.`shop_id` AS `shop_id`, 
    `p`.`generic_id` AS `generic_id`, 
    `p`.`created_at` AS `created_at`, 
    `p`.`updated_at` AS `updated_at`, 
    `p`.`sold_count` AS `sold_count`,
    `p`.`status` AS `status`,         -- Thêm status
    `p`.`shop_cate_id` AS `shop_cate_id`, -- THÊM DÒNG NÀY
    `g`.`name` AS `category_name`, 
    (SELECT `pi`.`image_url` FROM `productimages` `pi` WHERE `pi`.`product_id` = `p`.`id` AND `pi`.`is_main` = 1 LIMIT 1) AS `image_url`, 
    (SELECT IFNULL(AVG(`pr`.`rating`),0) FROM `productreviews` `pr` WHERE `pr`.`product_id` = `p`.`id`) AS `avg_rating`, 
    (`p`.`sold_count` * 0.6 + IFNULL((SELECT AVG(`pr`.`rating`) FROM `productreviews` `pr` WHERE `pr`.`product_id` = `p`.`id`),0) * 0.4) AS `hot_score` 
FROM (`products` `p` JOIN `generic` `g` ON(`g`.`id` = `p`.`generic_id`));
*/
// =================================================================


class productService {
    // ... (getProductOnIdService, getProductImgOnIdService, get5ProductOnShopIdService giữ nguyên) ...
    getProductOnIdService = async (id: number): Promise<Product> => {
        // --- TRUY VẤN 1: Lấy thông tin sản phẩm cốt lõi ---
        const [productRows] = await pool.query<Product[] & RowDataPacket[]>(
            `SELECT id, name, description, base_price, shop_id, sold_count 
           FROM products 
           WHERE id = ?`,
            [id]
        );
        const product = productRows[0];

        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        const [variantRows] = await pool.query<ProductVariant[] & RowDataPacket[]>(
            `SELECT id, price, stock, sku, image_url
            FROM productvariants 
            WHERE product_id = ?`,
            [id]
        );

        const [optionRows] = await pool.query<VariantOption[] & RowDataPacket[]>(
            `SELECT
            vov.variant_id,
            pa.name AS attribute,
            vov.value
           FROM
            variantoptionvalues vov
           JOIN
            product_attributes pa ON vov.attribute_id = pa.id
           WHERE
            vov.variant_id IN (
                -- Lấy các variant_id từ truy vấn 3 (chỉ cho sản phẩm này)
                SELECT id FROM productvariants WHERE product_id = ?
            )`,
            [id]
        );

        variantRows.forEach(variant => {
            // Lọc ra các tùy chọn (từ Query 4) thuộc về biến thể này
            variant.options = optionRows
                .filter(opt => opt.variant_id === variant.id);
        });
        // Gán mảng các biến thể (đã có options) vào object product
        product.product_variants = variantRows;

        return product as Product;
    }

    getProductImgOnIdService = async (id: number): Promise<ProductImage[]> => {
        const [rows] = await pool.query("SELECT image_id, image_url, is_main FROM productimages where product_id = ?", [id]) as unknown as [ProductImage[], any];
        return rows;
    }

    get5ProductOnShopIdService = async (shopId: Number): Promise<Product[]> => {
        const [rows] = await pool.query(
            `SELECT * FROM v_products_list WHERE shop_id = ? ORDER BY RAND() LIMIT 5`,
            [shopId]
        );
        return rows as Product[];
    }
    
    // SỬA LỖI HÀM NÀY
    getProductOnShopIdService = async (shopId: number, sort: string, cate: number) => {
        let orderBy = "id DESC";
        // Giờ bạn có thể sort theo 'hot_score' hoặc 'avg_rating'
        if (sort === "popular") { // 1
            orderBy = "hot_score DESC";
        } else if (sort === "new") { // 2
            orderBy = "created_at DESC";
        } else if (sort === "hot") { // 3
            orderBy = "sold_count DESC";
        }

        let whereClause = "WHERE shop_id = ?";
        const params: (string | number)[] = [shopId];

        // Sửa: 'cate' (từ query bst) chính là `shop_cate_id`
        // Frontend `Products.tsx` của bạn đang lọc ở client-side
        // Nhưng API `fetchProductsByShopId` của bạn lại dùng `cate`.
        // Tạm thời, tôi sẽ giữ logic API của bạn,
        // nhưng bạn NÊN CẬP NHẬT VIEW TRONG PHPMYADMIN (xem ở trên)
        if (cate && cate !== 0) {
            whereClause += " AND shop_cate_id = ?"; // Đảm bảo 'v_products_list' có cột này
            params.push(cate);
        }

        const [rows] = await pool.query(
            `SELECT * FROM v_products_list ${whereClause} ORDER BY ${orderBy}`,
            params
        );
        return rows;
    };

    // ... (Các hàm getReview..., getProductDetails... getAttribute... giữ nguyên) ...
    getReviewByProductIdService = async (id: number, type: number): Promise<ProductReview[]> => {
        let sql = "SELECT id, rating, comment, created_at, phone_number, avatar_url, email FROM productreviews JOIN users on phone_number = user_id where product_id = ?";
        const params = [id];
        if (type) {
            sql += " AND rating = ?";
            params.push(type);
        }
        const [reviews] = await pool.query(sql, params) as [ProductReview[], any];
        return reviews as ProductReview[];
    }

    getReviewSummaryByProductIdService = async (id: number) => {
        const sql = `
                 SELECT 
                     rating, 
                     COUNT(*) as count 
                 FROM 
                     productreviews
                 WHERE 
                     product_id = ? 
                 GROUP BY 
                     rating;
             `;

        const [results] = await pool.query(sql, [id]) as [Array<{ rating: number; count: number }>, any];

        const summary = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
            'total': 0, 'avg': 0
        };

        let totalCount = 0;
        let cnt = 0;

        for (const row of results) {
            if (summary.hasOwnProperty(row.rating)) {
                summary[row.rating as keyof typeof summary] = row.count; 
                totalCount += row.count;
                cnt += row.rating * row.count;
            }
        }

        summary.total = totalCount;
        if (totalCount)
            summary.avg = cnt / totalCount;
        else summary.avg = 0;

        return summary;
    }

    getProductDetailsByProductId = async (id: number) => {
        const [row] = await pool.query("SELECT id,product_id,attribute,value FROM product_detail WHERE product_id = ?", [id]);
        return row as ProductDetails[];
    }

    getAttributeOfProductVariantsByProductIdService = async (id: number) => {
        const [rows] = await pool.query(`
                       SELECT pa.name as attribute_name, 
                       GROUP_CONCAT(DISTINCT vov.value ORDER BY vov.value SEPARATOR ', ') AS attribute_values
                       FROM products as p JOIN productvariants as pv on pv.product_id = p.id 
                       JOIN variantoptionvalues as vov on vov.variant_id = pv.id 
                       JOIN product_attributes as pa on pa.id = vov.attribute_id 
                       WHERE p.id = ?
                       GROUP BY pa.name
                   `, [id]);

        const result = (rows as any[]).map(r => ({
            attribute: r.attribute_name,
            values: r.attribute_values ? r.attribute_values.split(', ') : []
        }));
        return result as AttributeOfProductVariants[];
    }

    // =================================================================
    // CÁC HÀM CRUD - KHÔNG THAY ĐỔI
    // (File service của bạn đã xử lý `shop_cate_id` RẤT TỐT RỒI)
    // =================================================================

    createProductService = async (productData: any) => {
        // File của bạn đã có `shop_cate_id` - Rất Tốt!
        const { shop_id, name, description, base_price, category_id, shop_cate_id, image_url, status } = productData;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Insert product
            const [result] = await connection.query<ResultSetHeader>(
                `INSERT INTO products (shop_id, name, description, base_price, generic_id, shop_cate_id, status, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                // Sửa 'category_id' thành 'generic_id' cho đúng schema
                [shop_id, name, description || null, base_price, category_id || null, shop_cate_id || null, status || 1]
            );

            const productId = result.insertId;

            // Insert default image if provided
            // Sửa: Bảng của bạn là 'productimages' (có s) và 'is_main' (không phải primary)
            if (image_url) {
                await connection.query(
                    `INSERT INTO productimages (product_id, image_url, is_main) 
                     VALUES (?, ?, 1)`,
                    [productId, image_url]
                );
            }

            await connection.commit();

            // Return created product
            // Sửa: Bảng của bạn là 'is_main'
            const [product] = await pool.query(
                `SELECT p.*, pi.image_url 
                 FROM products p 
                 LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_main = 1 
                 WHERE p.id = ?`,
                [productId]
            ) as [Product[], any];

            return product[0];

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

    // UPDATE product
    updateProductService = async (productId: number, productData: any) => {
        // File của bạn đã có `shop_cate_id` - Rất Tốt!
        const { name, description, base_price, category_id, shop_cate_id, image_url, status } = productData;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Update product
            // Sửa 'category_id' thành 'generic_id'
            await connection.query(
                `UPDATE products 
                 SET name = ?, description = ?, base_price = ?, generic_id = ?, shop_cate_id = ?, status = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [name, description || null, base_price, category_id || null, shop_cate_id || null, status || 1, productId]
            );

            // Update image if provided
            if (image_url) {
                // Sửa: Bảng của bạn là 'is_main'
                const [existingImages] = await connection.query(
                    'SELECT image_id FROM productimages WHERE product_id = ? AND is_main = 1',
                    [productId]
                );

                if ((existingImages as any[]).length > 0) {
                    // Update existing image
                    await connection.query(
                        'UPDATE productimages SET image_url = ? WHERE product_id = ? AND is_main = 1',
                        [image_url, productId]
                    );
                } else {
                    // Insert new image
                    await connection.query(
                        'INSERT INTO productimages (product_id, image_url, is_main) VALUES (?, ?, 1)',
                        [productId, image_url]
                    );
                }
            }

            await connection.commit();

            // Return updated product
            // Sửa: Bảng của bạn là 'is_main'
            const [product] = await pool.query(
                `SELECT p.*, pi.image_url 
                 FROM products p 
                 LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_main = 1 
                 WHERE p.id = ?`,
                [productId]
            ) as [Product[], any];

            return product[0];

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

    // ... (deleteProductService, verifyShopOwnershipService, logView... giữ nguyên) ...
    deleteProductService = async (productId: number) => {
        const connection = await pool.getConnection();
 
        try {
            await connection.beginTransaction();
 
            // Delete product images first (foreign key constraint)
            await connection.query('DELETE FROM productimages WHERE product_id = ?', [productId]);
 
            // Delete product reviews
            await connection.query('DELETE FROM productreviews WHERE product_id = ?', [productId]);
 
            // Delete product variants and related data if exists
            await connection.query('DELETE FROM variantoptionvalues WHERE variant_id IN (SELECT id FROM productvariants WHERE product_id = ?)', [productId]);
            await connection.query('DELETE FROM productvariants WHERE product_id = ?', [productId]);
 
            // Delete product details
            await connection.query('DELETE FROM product_detail WHERE product_id = ?', [productId]);
 
            // Finally delete the product
            await connection.query('DELETE FROM products WHERE id = ?', [productId]);
 
            await connection.commit();
 
            return { success: true, message: 'Product deleted successfully' };
 
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };
 
    verifyShopOwnershipService = async (productId: number, userId: string) => {
        const [rows] = await pool.query(
            `SELECT p.id, p.shop_id, s.owner_id 
             FROM products p 
             JOIN shops s ON p.shop_id = s.id 
             WHERE p.id = ? AND s.owner_id = ?`,
            [productId, userId]
        );
 
        return (rows as any[]).length > 0;
    };
 
    logView = async (userId: string | undefined, productId: number) => {
        const sql = `
             INSERT INTO UserViewHistory (user_id, product_id) 
             VALUES (?, ?)`;
        await pool.query(sql, [userId, productId]);
    }
 
    getForYouRecommendations = async (user_id: number | undefined) => {
        if (!user_id) {
            return this.getRandomRecommendations();
        }
        const [historyCheck] = await pool.query<RowDataPacket[]>(
            `SELECT 1 FROM UserViewHistory WHERE user_id = ? LIMIT 1`,
            [user_id]
        );
 
        if (historyCheck.length > 0) {
            return this.getRecommendationsFromHistory(user_id);
        } else {
            return this.getRandomRecommendations();
        }
    }
 
    getRandomRecommendations = async () => {
        const [rows] = await pool.query(`SELECT * FROM v_products_list ORDER BY RAND() LIMIT 15`);
        return rows;
    }
 
    getRecommendationsFromHistory = async (user_id: number) => {
        const [recentViewedIds] = await pool.query<RowDataPacket[]>(
            `SELECT DISTINCT product_id 
             FROM UserViewHistory 
             WHERE user_id = ? 
             ORDER BY viewed_at DESC 
             LIMIT 5`,
            [user_id]
        );
        const productIds = recentViewedIds.map(row => row.product_id);
 
        const [relatedCategoryIds] = await pool.query<RowDataPacket[]>(
            `SELECT DISTINCT generic_id 
             FROM products 
             WHERE id IN (?)`,
            [productIds]
        );
        if (relatedCategoryIds.length === 0) {
            return this.getRandomRecommendations();
        }
 
        const categoryIds = relatedCategoryIds.map(row => row.generic_id);
 
        const [recommendations] = await pool.query(
            `SELECT * FROM v_products_list
             WHERE generic_id IN (?) AND id NOT IN (?)
             ORDER BY RAND() 
             LIMIT 15`,
            [categoryIds, productIds]
        );
        return recommendations;
    }
 
    getProductsByKeyWordService = async (keyword: string): Promise<Product[]> => {
        const [rows] = await pool.query(`
                 SELECT 
                     products.id, 
                     products.name,                   
                     products.base_price,                   
                     productimages.image_url                   
                 FROM products 
                 LEFT JOIN productimages 
                     ON productimages.product_id = products.id 
                     AND productimages.is_main = 1
                 WHERE BINARY LOWER(products.name) LIKE LOWER(CONCAT('%', ? , '%'))
                 GROUP BY products.id
                 LIMIT 7
             `, [keyword]);
        return rows as Product[];
    }
    getBrandsOfProductByCategoryIdSerivice = async (category_id: number): Promise<BrandOfProduct[]> => {
        const [rows] = await pool.query(`
             SELECT DISTINCT b.id, b.name
             FROM brands b
             JOIN products p ON p.brand_id = b.id
             JOIN generic g ON p.generic_id = g.id
             WHERE g.category_id = ?
         `, [category_id]);
        return rows as unknown as BrandOfProduct[];
    }
    getBrandsOfProductByGenericIdSerivice = async (category_id: number): Promise<BrandOfProduct[]> => {
        const [rows] = await pool.query(`
             SELECT DISTINCT b.id, b.name
             FROM brands b
             JOIN products p ON p.brand_id = b.id
             WHERE p.generic_id = ?
         `, [category_id]);
        return rows as unknown as BrandOfProduct[];
 
    }
 
    getNewProducts = async () => {
        const sql = `
     SELECT * FROM (
         SELECT 
             products.id, 
             products.name, 
             products.description, 
             products.base_price, 
             products.shop_id, 
             productimages.image_url, 
             products.sold_count,
             generic.name as category_name
         FROM 
             products 
         JOIN 
             productimages on productimages.product_id = products.id
         JOIN 
             generic on generic.id = products.generic_id
         GROUP BY 
             products.id 
         ORDER BY 
             products.updated_at DESC
         LIMIT 100 -- Lấy 100 sản phẩm mới nhất
     ) AS newest_products
     ORDER BY 
         RAND()
     LIMIT 15;`;
 
        const [rows] = await pool.query(sql);
        return rows;
    }
 
    getHotPorducts = async () => {
        const sql = `
     SELECT * FROM (
         SELECT 
             products.id, 
             products.name, 
             products.description, 
             products.base_price, 
             products.shop_id, 
             productimages.image_url, 
             products.sold_count,
             generic.name as category_name
         FROM 
             products 
         JOIN 
             productimages on productimages.product_id = products.id
         JOIN 
             generic on generic.id = products.generic_id
         LEFT JOIN 
             productreviews on productreviews.product_id = products.id
         GROUP BY 
             products.id 
         ORDER BY 
             (sold_count * 0.6 + IFNULL(AVG(rating), 0) * 0.4) DESC
         LIMIT 20
     ) AS newest_products
     ORDER BY 
         RAND()
     LIMIT 15;`;
 
        const [rows] = await pool.query(sql);
        return rows;
    }
 
    getProductsService = async (whereClause: string, params: any[], page: number = 1, limit: number = 12, orderBy: string = ""): Promise<ProductResponse> => {
        return paginationProducts(whereClause, params, page, limit, orderBy);
    }
}

export default new productService();