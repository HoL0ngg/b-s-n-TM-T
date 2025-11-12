import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Product, ProductReview, ProductDetails, AttributeOfProductVariants, BrandOfProduct, ProductVariant, VariantOption, ProductResponse, ProductImage, UpdatePromoItemDto, CreatePromotionData } from "../models/product.model";
import { ResultSetHeader } from 'mysql2';
import { paginationProducts } from "../helpers/pagination.helper";

class productService {
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

        const sql_variants = `
                SELECT 
                    pv.id, 
                    pv.price AS original_price,
                    pv.stock, 
                    pv.sku, 
                    pv.image_url,
                    
                    -- Lấy % giảm giá (nếu có)
                    pi.discount_value AS discount_percentage,
                    
                    -- Tính giá sale (nếu có)
                    (CASE
                        WHEN pi.discount_value IS NOT NULL 
                        THEN (pv.price * (1 - (pi.discount_value / 100)))
                        ELSE NULL 
                    END) AS sale_price
                    
                FROM 
                    productvariants pv
                
                -- Dùng LEFT JOIN để vẫn lấy được biến thể dù không có KM
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

    getProductOnShopIdService = async (shopId: number, sort: string, cate?: number) => {
        let orderBy = "id DESC";
        // Giờ bạn có thể sort theo 'hot_score' hoặc 'avg_rating'
        if (sort === "popular") {
            orderBy = "hot_score DESC";
        } else if (sort === "hot") {
            orderBy = "sold_count DESC";
        } else if (sort === "new") {
            orderBy = "created_at DESC";
        }

        let whereClause = "WHERE shop_id = ?";
        const params: (string | number)[] = [shopId];

        if (cate) {
            whereClause += " AND shop_cate_id = ?"; // (Lưu ý: View của bạn chưa có shop_cate_id)
            params.push(cate);
        }

        const [rows] = await pool.query(
            `SELECT * FROM v_products_list ${whereClause} ORDER BY ${orderBy}`,
            params
        );
        return rows;
    };

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

        // 2. Khởi tạo một object kết quả chuẩn
        // Để đảm bảo 1 sao, 2 sao... luôn có, kể cả khi count = 0
        const summary = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
            'total': 0,
            'avg': 0
        };

        let totalCount = 0;
        let cnt = 0;

        // 3. Đổ dữ liệu từ database vào object summary
        for (const row of results) {
            // row sẽ có dạng { rating: 5, count: 20000 }
            if (summary.hasOwnProperty(row.rating)) {
                summary[row.rating as keyof typeof summary] = row.count; // Gán số lượng đếm
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
    createProductService = async (productData: any) => {
        const { shop_id, name, description, base_price, category_id, shop_cate_id, image_url, status } = productData;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Insert product
            const [result] = await connection.query<ResultSetHeader>(
                `INSERT INTO products (shop_id, name, description, base_price, category_id, shop_cate_id, status, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [shop_id, name, description || null, base_price, category_id || null, shop_cate_id || null, status || 1]
            );

            const productId = result.insertId;

            // Insert default image if provided
            if (image_url) {
                await connection.query(
                    `INSERT INTO productimages (product_id, image_url, is_primary, created_at) 
                     VALUES (?, ?, 1, NOW())`,
                    [productId, image_url]
                );
            }

            await connection.commit();

            // Return created product
            const [product] = await pool.query(
                `SELECT p.*, pi.image_url 
                 FROM products p 
                 LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_primary = 1 
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
        const { name, description, base_price, category_id, shop_cate_id, image_url, status } = productData;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Update product
            await connection.query(
                `UPDATE products 
                 SET name = ?, description = ?, base_price = ?, category_id = ?, shop_cate_id = ?, status = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [name, description || null, base_price, category_id || null, shop_cate_id || null, status || 1, productId]
            );

            // Update image if provided
            if (image_url) {
                // Check if image exists
                const [existingImages] = await connection.query(
                    'SELECT image_id FROM productimages WHERE product_id = ? AND is_primary = 1',
                    [productId]
                );

                if ((existingImages as any[]).length > 0) {
                    // Update existing image
                    await connection.query(
                        'UPDATE productimages SET image_url = ? WHERE product_id = ? AND is_primary = 1',
                        [image_url, productId]
                    );
                } else {
                    // Insert new image
                    await connection.query(
                        'INSERT INTO productimages (product_id, image_url, is_primary, created_at) VALUES (?, ?, 1, NOW())',
                        [productId, image_url]
                    );
                }
            }

            await connection.commit();

            // Return updated product
            const [product] = await pool.query(
                `SELECT p.*, pi.image_url 
                 FROM products p 
                 LEFT JOIN productimages pi ON p.id = pi.product_id AND pi.is_primary = 1 
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

    // DELETE product
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

    // Verify shop ownership (for authorization)
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
        // 2. Nếu là user, kiểm tra xem có lịch sử xem không
        const [historyCheck] = await pool.query<RowDataPacket[]>(
            `SELECT 1 FROM UserViewHistory WHERE user_id = ? LIMIT 1`,
            [user_id]
        );

        // 3. Quyết định
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

        // 2. Lấy danh mục của các sản phẩm đó
        const [relatedCategoryIds] = await pool.query<RowDataPacket[]>(
            `SELECT DISTINCT generic_id 
             FROM products 
             WHERE id IN (?)`,
            [productIds]
        );
        if (relatedCategoryIds.length === 0) {
            // Nếu không tìm thấy danh mục (lỗi), trả về ngẫu nhiên
            return this.getRandomRecommendations();
        }

        const categoryIds = relatedCategoryIds.map(row => row.generic_id);

        // 3. Lấy sản phẩm TỪ CÁC DANH MỤC ĐÓ
        // (Và loại trừ sản phẩm đã xem)
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

    getPromotionsByShopId = async (shopId: number) => {
        const [rows] = await pool.query(
            "SELECT * FROM promotions WHERE shop_id = ? ORDER BY start_date DESC",
            [shopId]
        );
        return rows; // Trả về mảng Promotion[]
    }

    getItemsByPromotionId = async (promotionId: number) => {
        const sql = `
            SELECT
                pi.promotion_id,
                pi.product_variant_id,
                pi.discount_value,
                
                pv.price AS original_price,
                pv.stock,
                
                p.name AS product_name,
                
                (SELECT img.image_url FROM productimages img 
                WHERE img.product_id = p.id AND img.is_main = 1 LIMIT 1) AS product_image,

                (SELECT GROUP_CONCAT(CONCAT(pa.name, ': ', vov.value) SEPARATOR ', ')
                FROM variantoptionvalues vov
                JOIN product_attributes pa ON vov.attribute_id = pa.id
                WHERE vov.variant_id = pv.id
                ) AS options_string
                -- -----------------------------------
                
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
            // --- BƯỚC 1: Tìm giá (price) thấp nhất ---
            // (Chúng ta dùng IFNULL để xử lý cả sale_price nếu bạn có)
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT MIN(price) as min_price 
             FROM productvariants 
             WHERE product_id = ?`,
                [productId]
            );

            const min_price = rows[0].min_price || 0;

            // --- BƯỚC 2: Cập nhật giá này vào bảng 'products' cha ---
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
        await pool.query(
            "UPDATE promotion_items SET discount_value = ? WHERE promotion_id = ? AND product_variant_id = ?",
            [discountValue, promoId, variantId]
        );
    }

    deleteItem = async (promoId: number, variantId: number) => {
        await pool.query(
            "DELETE FROM promotion_items WHERE promotion_id = ? AND product_variant_id = ?",
            [promoId, variantId]
        );
    }

    syncPromotionItems = async (promotionId: number, items: UpdatePromoItemDto[]) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // --- BƯỚC 1: XÓA các item không còn trong danh sách mới ---
            const newVariantIds = items.map(i => i.product_variant_id);
            console.log(promotionId);


            if (newVariantIds.length > 0) {
                // Nếu danh sách mới có item, giữ lại chúng, xóa những cái khác
                await connection.query(
                    `DELETE FROM promotion_items 
                     WHERE promotion_id = ? AND product_variant_id NOT IN (?)`,
                    [promotionId, newVariantIds]
                );
            } else {
                // Nếu danh sách mới rỗng, xóa HẾT item của khuyến mãi này
                await connection.query(
                    "DELETE FROM promotion_items WHERE promotion_id = ?",
                    [promotionId]
                );
            }

            // --- BƯỚC 2: UPSERT (Thêm mới hoặc Cập nhật) các item trong danh sách ---
            if (items.length > 0) {
                // Chuẩn bị dữ liệu cho bulk INSERT: [[promoId, variantId1, 10%], [promoId, variantId2, 15%]]
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
            await connection.rollback(); // Hoàn tác nếu có lỗi
            throw error;
        } finally {
            connection.release(); // Trả kết nối về pool
        }
    }
    updateProductStatusService = async (productId: number, status: number, reason?: string) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Cập nhật trạng thái sản phẩm
            const [updateResult]: any = await conn.query(
                `UPDATE products 
             SET status = ? 
             WHERE id = ?`,
                [status, productId]
            );

            if (updateResult.affectedRows === 0) {
                await conn.rollback();
                return false; // Không tìm thấy sản phẩm
            }

            // Nếu bị từ chối thì lưu lý do vào bảng product_rejections
            if (status === -1 && reason) {
                console.log("hahha");

                await conn.query(
                    `INSERT INTO product_rejections (product_id, reason)
                 VALUES (?, ?)`,
                    [productId, reason]
                );
            }

            await conn.commit();
            return true;
        } catch (error) {
            await conn.rollback();
            console.error("❌ Lỗi trong updateProductStatusService:", error);
            throw error;
        } finally {
            conn.release();
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

        // Trả về sự kiện mới (bao gồm ID mới tạo)
        return {
            id: result.insertId,
            ...data,
            is_active: 1
        };
    }

}

export default new productService();
