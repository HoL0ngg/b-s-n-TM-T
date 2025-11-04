import pool from "../config/db";
import { Product, ProductReview, ProductDetails, AttributeOfProductVariants } from "../models/product.model";
import { ResultSetHeader } from 'mysql2';   
class productService {
    getProductOnCategoryIdService = async (Category_id: number): Promise<Product[]> => {
        const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id where category_id = ? Group by id", [Category_id]);
        return rows as Product[];
    };

    getProductOnIdService = async (id: number): Promise<Product> => {
        const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id where products.id = ?", [id]) as [Product[], any];
        return rows[0] as Product;
    }

    getProductImgOnIdService = async (id: number): Promise<string[]> => {
        const [rows] = await pool.query("SELECT image_id, image_url FROM productimages where product_id = ?", [id]) as unknown as [string[], any];
        return rows;
    }

    get5ProductOnShopIdService = async (id: Number): Promise<Product[]> => {
        const [rows] = await pool.query("SELECT id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id where shop_id = ? Group by id limit 5", [id]);
        return rows as Product[];
    }

    getProductOnShopIdService = async (shopId: number, sort: string, cate?: number) => {
        let orderBy = "id DESC";

        if (sort === "popular") {
            orderBy = "(sold_count * 0.6 + IFNULL(AVG(rating), 0) * 0.4) DESC";
        } else if (sort === "hot") {
            orderBy = "sold_count DESC";
        } else if (sort === "new") {
            orderBy = "products.created_at DESC";
        }
        let hihi = "";
        const params = [shopId];
        if (cate) {
            hihi = "AND shop_cate_id = ?";
            params.push(cate);
        }

        const [rows] = await pool.query(
            `SELECT products.id, name, description, base_price, shop_id, image_url, sold_count FROM products JOIN productimages on productimages.product_id = products.id LEFT JOIN productreviews on productreviews.product_id = products.id WHERE products.shop_id = ? ${hihi} Group by products.id ORDER BY ${orderBy}`,
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
        const [row] = await pool.query("SELECT * FROM products JOIN product_detail ON products.id = product_detail.product_id WHERE products.id = ?", [id]);
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

}

export default new productService();