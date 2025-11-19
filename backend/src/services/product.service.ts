// Đường dẫn: backend/src/services/product.service.ts
// (PHIÊN BẢN ĐÃ SỬA LỖI TRÙNG LẶP HÀM)

import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Product, ProductReview, ProductDetails, AttributeOfProductVariants, BrandOfProduct, ProductVariant, VariantOption, ProductResponse, ProductImage, UpdatePromoItemDto, CreatePromotionData } from "../models/product.model";
import { ResultSetHeader } from 'mysql2';
import { paginationProducts } from "../helpers/pagination.helper";

class productService {
    // ... (Tất cả các hàm GET (getProductOnIdService, getProductImgOnIdService, ...) giữ nguyên) ...

    // LẤY PHIÊN BẢN NÂNG CẤP CỦA `main` (có giá sale)
    getProductOnIdService = async (id: number): Promise<Product> => {
        const [productRows] = await pool.query<Product[] & RowDataPacket[]>(`SELECT id, name, description, base_price, shop_id, sold_count FROM products WHERE id = ?`, [id]);
        const product = productRows[0];

        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        const sql_variants = `
                 SELECT 
                     pv.id, 
                     pv.price AS original_price,
                     pv.stock, 
                     pv.sku, 
                     pv.image_url,
                     
                     pi.discount_value AS discount_percentage,
                     
                     (CASE
                         WHEN pi.discount_value IS NOT NULL 
                         THEN (pv.price * (1 - (pi.discount_value / 100)))
                         ELSE NULL 
                     END) AS sale_price,

                     (CASE
                         WHEN pi.discount_value IS NOT NULL 
                         THEN (pv.price * (1 - (pi.discount_value / 100)))
                         ELSE pv.price
                     END) AS price
                     
                 FROM 
                     productvariants pv
                 
                 LEFT JOIN 
                     promotion_items pi ON pv.id = pi.product_variant_id
                 LEFT JOIN 
                     promotions promo ON pi.promotion_id = promo.id
                         AND promo.is_active = 1
                         AND NOW() BETWEEN promo.start_date AND promo.end_date
                         
                 WHERE 
                     pv.product_id = ?;
             `;
        const [variantRows] = await pool.query<ProductVariant[] & RowDataPacket[]>(
            sql_variants,
            [id]
        );

        const [optionRows] = await pool.query<VariantOption[] & RowDataPacket[]>(
            `SELECT vov.variant_id, pa.name AS attribute, vov.value
           FROM variantoptionvalues vov
           JOIN product_attributes pa ON vov.attribute_id = pa.id
           WHERE vov.variant_id IN (SELECT id FROM productvariants WHERE product_id = ?)`,
            [id]
        );
        variantRows.forEach(variant => {
            variant.options = optionRows.filter(opt => opt.variant_id === variant.id);
        });
        product.product_variants = variantRows;
        return product as Product;
    }

    getProductImgOnIdService = async (id: number): Promise<ProductImage[]> => {
        const [rows] = await pool.query("SELECT image_id, image_url, is_main FROM productimages where product_id = ?", [id]) as unknown as [ProductImage[], any];
        return rows;
    }
    get5ProductOnShopIdService = async (shopId: Number): Promise<Product[]> => {
        const [rows] = await pool.query(`SELECT * FROM v_products_list WHERE shop_id = ? ORDER BY RAND() LIMIT 5`, [shopId]);
        return rows as Product[];
    }
    getProductOnShopIdService = async (shopId: number, sort: string, cate: number) => {
        let orderBy = "id DESC";
        if (sort === "popular") { orderBy = "hot_score DESC"; }
        else if (sort === "new") { orderBy = "created_at DESC"; }
        else if (sort === "hot") { orderBy = "sold_count DESC"; }
        let whereClause = "WHERE shop_id = ?";
        const params: (string | number)[] = [shopId];
        if (cate && cate !== 0) {
            whereClause += " AND shop_cate_id = ?";
            params.push(cate);
        }
        const [rows] = await pool.query(`SELECT * FROM v_products_list ${whereClause} ORDER BY ${orderBy}`, params);
        return rows;
    };
    getReviewByProductIdService = async (id: number, type: number): Promise<ProductReview[]> => {
        let sql = `SELECT 
             pr.id, 
             pr.rating, 
             pr.comment, 
             pr.created_at, 
             u.phone_number, 
             u.avatar_url, 
             u.email 
           FROM productreviews pr 
           JOIN users u ON pr.user_id = u.phone_number 
           WHERE pr.product_id = ?`;
        const params = [id];
        if (type) {
            sql += " AND rating = ?";
            params.push(type);
        }
        const [reviews] = await pool.query(sql, params) as [ProductReview[], any];
        return reviews as ProductReview[];
    }
    getReviewSummaryByProductIdService = async (id: number) => {
        const sql = `SELECT rating, COUNT(*) as count FROM productreviews WHERE product_id = ? GROUP BY rating;`;
        const [results] = await pool.query(sql, [id]) as [Array<{ rating: number; count: number }>, any];
        const summary = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 'total': 0, 'avg': 0 };
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
        summary.avg = totalCount ? cnt / totalCount : 0;
        return summary;
    }
    getProductDetailsByProductId = async (id: number) => {
        const [row] = await pool.query("SELECT id, product_id, attribute, value FROM product_detail WHERE product_id = ?", [id]);
        return (row as RowDataPacket[]).map(r => ({
            id: r.id,
            product_id: r.product_id,
            attribute: r.attribute,
            value: r.value
        })) as ProductDetails[];
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

    // --- CÁC HÀM CRUD (CỦA BẠN - qhuykuteo) ---
    createProductService = async (productData: any) => {
        const { shop_id, name, description, category_id, shop_cate_id, image_url, status, attribute_id, variations, details } = productData;
        let base_price = productData.base_price || 0;
        if (variations && variations.length > 0) { base_price = Math.min(...variations.map((v: any) => v.price)); }
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query<ResultSetHeader>(`INSERT INTO products (shop_id, name, description, base_price, generic_id, shop_cate_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [shop_id, name, description || null, base_price, category_id || null, shop_cate_id || null, status || 1]);
            const productId = result.insertId;
            if (image_url) { await connection.query(`INSERT INTO productimages (product_id, image_url, is_main) VALUES (?, ?, 1)`, [productId, image_url]); }
            if (variations && variations.length > 0 && attribute_id) {
                for (const variation of variations) {
                    const [variantResult] = await connection.query<ResultSetHeader>(`INSERT INTO productvariants (product_id, price, stock, sku, image_url) VALUES (?, ?, ?, ?, ?)`, [productId, variation.price, variation.stock, variation.sku || null, variation.image_url || null]);
                    const variantId = variantResult.insertId;
                    await connection.query(`INSERT INTO variantoptionvalues (variant_id, attribute_id, value) VALUES (?, ?, ?)`, [variantId, attribute_id, variation.value]);
                }
            } else {
                await connection.query<ResultSetHeader>(`INSERT INTO productvariants (product_id, price, stock) VALUES (?, ?, ?)`, [productId, base_price, productData.stock || 0]);
            }
            if (details && Array.isArray(details) && details.length > 0) {
                const detailValues = details.map((d: any) => [productId, d.key, d.value]);
                await connection.query(`INSERT INTO product_detail (product_id, attribute, value) VALUES ?`, [detailValues]);
            }
            await connection.commit();
            const [product] = await pool.query(`SELECT p.*, pi.image_url FROM products p LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_main = 1 WHERE p.id = ?`, [productId]) as [Product[], any];
            return product[0];
        } catch (error) {
            await connection.rollback();
            console.error("Lỗi Transaction khi tạo sản phẩm:", error);
            throw error;
        } finally {
            connection.release();
        }
    };
    updateProductService = async (productId: number, productData: any) => {
        const { name, description, category_id, shop_cate_id, image_url, status, attribute_id, variations, details } = productData;
        let base_price = productData.base_price || 0;
        if (variations && variations.length > 0) { base_price = Math.min(...variations.map((v: any) => v.price)); }
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(`UPDATE products SET name = ?, description = ?, base_price = ?, generic_id = ?, shop_cate_id = ?, status = ?, updated_at = NOW() WHERE id = ?`, [name, description || null, base_price, category_id || null, shop_cate_id || null, status || 1, productId]);
            if (image_url) {
                const [existingImages] = await connection.query('SELECT image_id FROM productimages WHERE product_id = ? AND is_main = 1', [productId]);
                if ((existingImages as any[]).length > 0) {
                    await connection.query('UPDATE productimages SET image_url = ? WHERE product_id = ? AND is_main = 1', [image_url, productId]);
                } else {
                    await connection.query('INSERT INTO productimages (product_id, image_url, is_main) VALUES (?, ?, 1)', [productId, image_url]);
                }
            }
            await connection.query('DELETE FROM variantoptionvalues WHERE variant_id IN (SELECT id FROM productvariants WHERE product_id = ?)', [productId]);
            await connection.query('DELETE FROM productvariants WHERE product_id = ?', [productId]);
            if (variations && variations.length > 0 && attribute_id) {
                for (const variation of variations) {
                    const [variantResult] = await connection.query<ResultSetHeader>(`INSERT INTO productvariants (product_id, price, stock, sku, image_url) VALUES (?, ?, ?, ?, ?)`, [productId, variation.price, variation.stock, variation.sku || null, variation.image_url || null]);
                    const variantId = variantResult.insertId;
                    await connection.query(`INSERT INTO variantoptionvalues (variant_id, attribute_id, value) VALUES (?, ?, ?)`, [variantId, attribute_id, variation.value]);
                }
            } else {
                await connection.query<ResultSetHeader>(`INSERT INTO productvariants (product_id, price, stock) VALUES (?, ?, ?)`, [productId, base_price, productData.stock || 0]);
            }
            await connection.query('DELETE FROM product_detail WHERE product_id = ?', [productId]);
            if (details && Array.isArray(details) && details.length > 0) {
                const detailValues = details.map((d: any) => [productId, d.key, d.value]);
                await connection.query(`INSERT INTO product_detail (product_id, attribute, value) VALUES ?`, [detailValues]);
            }
            await connection.commit();
            const [product] = await pool.query(`SELECT p.*, pi.image_url FROM products p LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_main = 1 WHERE p.id = ?`, [productId]) as [Product[], any];
            return product[0];
        } catch (error) {
            await connection.rollback();
            console.error("Lỗi Transaction khi cập nhật sản phẩm:", error);
            throw error;
        } finally {
            connection.release();
        }
    };
    deleteProductService = async (productId: number) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query('DELETE FROM productimages WHERE product_id = ?', [productId]);
            await connection.query('DELETE FROM productreviews WHERE product_id = ?', [productId]);
            await connection.query('DELETE FROM variantoptionvalues WHERE variant_id IN (SELECT id FROM productvariants WHERE product_id = ?)', [productId]);
            await connection.query('DELETE FROM productvariants WHERE product_id = ?', [productId]);
            await connection.query('DELETE FROM product_detail WHERE product_id = ?', [productId]);
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
        const [rows] = await pool.query(`SELECT p.id, p.shop_id, s.owner_id FROM products p JOIN shops s ON p.shop_id = s.id WHERE p.id = ? AND s.owner_id = ?`, [productId, userId]);
        return (rows as any[]).length > 0;
    };
    logView = async (userId: string | undefined, productId: number) => {
        const sql = `INSERT INTO UserViewHistory (user_id, product_id) VALUES (?, ?)`;
        await pool.query(sql, [userId, productId]);
    }
    getForYouRecommendations = async (user_id: number | undefined) => {
        if (!user_id) { return this.getRandomRecommendations(); }
        const [historyCheck] = await pool.query<RowDataPacket[]>(`SELECT 1 FROM UserViewHistory WHERE user_id = ? LIMIT 1`, [user_id]);
        if (historyCheck.length > 0) { return this.getRecommendationsFromHistory(user_id); } else { return this.getRandomRecommendations(); }
    }
    getRandomRecommendations = async () => {
        const [rows] = await pool.query(`SELECT * FROM v_products_list ORDER BY RAND() LIMIT 15`);
        return rows;
    }
    getRecommendationsFromHistory = async (user_id: number) => {
        const [recentViewedIds] = await pool.query<RowDataPacket[]>(`SELECT DISTINCT product_id FROM UserViewHistory WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 5`, [user_id]);
        const productIds = recentViewedIds.map(row => row.product_id);
        const [relatedCategoryIds] = await pool.query<RowDataPacket[]>(`SELECT DISTINCT generic_id FROM products WHERE id IN (?)`, [productIds]);
        if (relatedCategoryIds.length === 0) { return this.getRandomRecommendations(); }
        const categoryIds = relatedCategoryIds.map(row => row.generic_id);
        const [recommendations] = await pool.query(`SELECT * FROM v_products_list WHERE generic_id IN (?) AND id NOT IN (?) ORDER BY RAND() LIMIT 15`, [categoryIds, productIds]);
        return recommendations;
    }
    getProductsByKeyWordService = async (keyword: string): Promise<Product[]> => {
        const [rows] = await pool.query(`SELECT products.id, products.name, products.base_price, productimages.image_url FROM products LEFT JOIN productimages ON productimages.product_id = products.id AND productimages.is_main = 1 WHERE BINARY LOWER(products.name) LIKE LOWER(CONCAT('%', ? , '%')) GROUP BY products.id LIMIT 7`, [keyword]);
        return rows as Product[];
    }
    getBrandsOfProductByCategoryIdSerivice = async (category_id: number): Promise<BrandOfProduct[]> => {
        const [rows] = await pool.query(`SELECT DISTINCT b.id, b.name FROM brands b JOIN products p ON p.brand_id = b.id JOIN generic g ON p.generic_id = g.id WHERE g.category_id = ?`, [category_id]);
        return rows as unknown as BrandOfProduct[];
    }
    getBrandsOfProductByGenericIdSerivice = async (category_id: number): Promise<BrandOfProduct[]> => {
        const [rows] = await pool.query(`SELECT DISTINCT b.id, b.name FROM brands b JOIN products p ON p.brand_id = b.id WHERE p.generic_id = ?`, [category_id]);
        return rows as unknown as BrandOfProduct[];
    }
    getNewProducts = async () => {
        const sql = `SELECT * FROM (SELECT products.id, products.name, products.description, products.base_price, products.shop_id, productimages.image_url, products.sold_count, generic.name as category_name FROM products JOIN productimages on productimages.product_id = products.id JOIN generic on generic.id = products.generic_id GROUP BY products.id ORDER BY products.updated_at DESC LIMIT 100) AS newest_products ORDER BY RAND() LIMIT 15;`;
        const [rows] = await pool.query(sql);
        return rows;
    }
    getHotPorducts = async () => {
        const sql = `SELECT * FROM (SELECT products.id, products.name, products.description, products.base_price, products.shop_id, productimages.image_url, products.sold_count, generic.name as category_name FROM products JOIN productimages on productimages.product_id = products.id JOIN generic on generic.id = products.generic_id LEFT JOIN productreviews on productreviews.product_id = products.id GROUP BY products.id ORDER BY (sold_count * 0.6 + IFNULL(AVG(rating), 0) * 0.4) DESC LIMIT 20) AS newest_products ORDER BY RAND() LIMIT 15;`;
        const [rows] = await pool.query(sql);
        return rows;
    }
    getProductsService = async (whereClause: string, params: any[], page: number = 1, limit: number = 12, orderBy: string = ""): Promise<ProductResponse> => {
        return paginationProducts(whereClause, params, page, limit, orderBy);
    }
    getAllAttributesService = async () => {
        const [rows] = await pool.query("SELECT id, name FROM product_attributes");
        return rows;
    };
    getCompleteProductForEditService = async (productId: number, shopId: number) => {
        const [productRows] = await pool.query<RowDataPacket[]>(`SELECT id, name, description, shop_cate_id, status, generic_id FROM products WHERE id = ? AND shop_id = ?`, [productId, shopId]);
        if (productRows.length === 0) { throw new Error('Không tìm thấy sản phẩm hoặc bạn không có quyền sửa sản phẩm này.'); }
        const product = productRows[0];
        const [imageRows] = await pool.query<RowDataPacket[]>(`SELECT image_url FROM productimages WHERE product_id = ? AND is_main = 1`, [productId]);
        product.image_url = imageRows.length > 0 ? imageRows[0].image_url : null;
        const [variantRows] = await pool.query<RowDataPacket[]>(`SELECT pv.id as variant_id, pv.price, pv.stock, pv.sku, pv.image_url, vov.attribute_id, vov.value FROM productvariants pv LEFT JOIN variantoptionvalues vov ON pv.id = vov.variant_id WHERE pv.product_id = ?`, [productId]);
        const [detailRows] = await pool.query<RowDataPacket[]>(`SELECT attribute, value FROM product_detail WHERE product_id = ?`, [productId]);
        product.details = detailRows.map(d => ({ key: d.attribute, value: d.value }));
        if (variantRows.length === 0) {
            product.variations = [];
            product.attribute_id = null;
        } else {
            const firstVariant = variantRows[0];
            if (firstVariant.attribute_id) {
                product.attribute_id = firstVariant.attribute_id;
                product.variations = variantRows.map(v => ({ value: v.value, price: v.price, stock: v.stock, sku: v.sku, image_url: v.image_url }));
            } else {
                product.attribute_id = null;
                product.base_price = firstVariant.price;
                product.stock = firstVariant.stock;
                product.variations = [];
            }
        }
        return product;
    };

    // =================================================================
    // NÂNG CẤP MỚI: Chỉ giữ 1 hàm updateProductStatusService (của bạn)
    // =================================================================
    updateProductStatusService = async (productId: number, shopId: number, status: number) => {
        const [result] = await pool.query<ResultSetHeader>(
            "UPDATE products SET status = ? WHERE id = ? AND shop_id = ?",
            [status, productId, shopId]
        );
        return result.affectedRows > 0;
    };

    // =================================================================
    // CÁC HÀM MỚI (LẤY TỪ NHÁNH `main` CỦA ĐỒNG ĐỘI)
    // =================================================================
    getPromotionsByShopId = async (shopId: number) => {
        const [rows] = await pool.query(
            "SELECT * FROM promotions WHERE shop_id = ? ORDER BY start_date DESC",
            [shopId]
        );
        return rows;
    }

    getItemsByPromotionId = async (promotionId: number, shopId: number) => {
        const promo = await this.findById(promotionId);
        if (!promo || promo.shop_id !== shopId) {
            throw new Error('FORBIDDEN');
        }

        const sql = `
            SELECT
                pi.promotion_id, pi.product_variant_id, pi.discount_value,
                pv.price AS original_price, pv.stock,
                p.name AS product_name,
                (SELECT img.image_url FROM productimages img 
                WHERE img.product_id = p.id AND img.is_main = 1 LIMIT 1) AS product_image,
                (SELECT GROUP_CONCAT(CONCAT(pa.name, ': ', vov.value) SEPARATOR ', ')
                FROM variantoptionvalues vov
                JOIN product_attributes pa ON vov.attribute_id = pa.id
                WHERE vov.variant_id = pv.id
                ) AS options_string
            FROM 
                promotion_items pi
            JOIN 
                productvariants pv ON pi.product_variant_id = pv.id
            JOIN 
                products p ON pv.product_id = p.id
            WHERE 
                pi.promotion_id = ?;
        `;
        const [rows] = await pool.query(sql, [promotionId]);
        return rows;
    }

    updateProductBasePrice = async (productId: number) => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT MIN(price) as min_price 
               FROM productvariants 
               WHERE product_id = ?`,
                [productId]
            );
            const min_price = rows[0].min_price || 0;
            await pool.query(
                "UPDATE products SET base_price = ? WHERE id = ?",
                [min_price, productId]
            );
            console.log(`Đã cập nhật base_price cho product ${productId} thành ${min_price}`);
        } catch (error) {
            console.error("Lỗi khi đồng bộ base_price:", error);
        }
    }

    findById = async (promotionId: number) => {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM promotions WHERE id = ?",
            [promotionId]
        );
        return rows[0];
    }

    updateItem = async (shopId: number, promoId: number, variantId: number, discountValue: number) => {
        const promo = await this.findById(promoId);
        if (!promo || promo.shop_id !== shopId) {
            throw new Error('FORBIDDEN');
        }
        await pool.query(
            "UPDATE promotion_items SET discount_value = ? WHERE promotion_id = ? AND product_variant_id = ?",
            [discountValue, promoId, variantId]
        );
    }

    deleteItem = async (promoId: number, variantId: number) => {
        // (Cần thêm kiểm tra quyền)
        await pool.query(
            "DELETE FROM promotion_items WHERE promotion_id = ? AND product_variant_id = ?",
            [promoId, variantId]
        );
    }

    syncPromotionItems = async (promotionId: number, items: UpdatePromoItemDto[], shopId: number) => {
        const promo = await this.findById(promotionId);
        if (!promo || promo.shop_id !== shopId) {
            throw new Error('FORBIDDEN');
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const newVariantIds = items.map(i => i.product_variant_id);
            console.log(promotionId);

            if (newVariantIds.length > 0) {
                await connection.query(
                    `DELETE FROM promotion_items 
                     WHERE promotion_id = ? AND product_variant_id NOT IN (?)`,
                    [promotionId, newVariantIds]
                );
            } else {
                await connection.query(
                    "DELETE FROM promotion_items WHERE promotion_id = ?",
                    [promotionId]
                );
            }

            if (items.length > 0) {
                const insertValues = items.map(item => [
                    promotionId,
                    item.product_variant_id,
                    item.discount_value
                ]);
                const sqlUpsert = `
                    INSERT INTO promotion_items (promotion_id, product_variant_id, discount_value)
                    VALUES ?
                    ON DUPLICATE KEY UPDATE
                        discount_value = VALUES(discount_value)
                `;
                await connection.query(sqlUpsert, [insertValues]);
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    createPromotion = async (data: CreatePromotionData) => {
        const { name, start_date, end_date, banner_url, shop_id } = data;

        const sql = `
            INSERT INTO promotions 
                (name, start_date, end_date, banner_url, shop_id, is_active)
            VALUES (?, ?, ?, ?, ?, 1) 
        `;

        const [result] = await pool.query<ResultSetHeader>(sql,
            [name, start_date, end_date, banner_url, shop_id]
        );

        return {
            id: result.insertId,
            ...data,
            is_active: 1
        };
    }

    getProductsOnShopId = async (shopId: number): Promise<Product[]> => {
        let query = `
            SELECT p.*
            FROM products p
            WHERE p.shop_id = ?
        `;
        const [rows] = await pool.query(query, [shopId]);
        return rows as Product[];
    }

}
export default new productService();