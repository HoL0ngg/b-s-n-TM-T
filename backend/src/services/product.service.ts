import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Product, ProductReview, ProductDetails, AttributeOfProductVariants, ProductVariant, VariantOption } from "../models/product.model";
import { paginationProducts } from "../helpers/pagination.helper";
class productService {
    getProductOnCategoryIdService = async (categoryId: number, page: number, limit: number) => {
        const whereClause = `
      WHERE products.generic_id IN (
        SELECT gen.id FROM generic gen WHERE gen.category_id = ?
      )`;
        return paginationProducts(whereClause, [categoryId], page, limit);
    };

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
            `SELECT id, price, stock, sku 
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

    getProductsInPriceOrderService = async (categoryId: number, page: number, limit: number, typeOfSort: string) => {
        const whereClause = `
      WHERE products.generic_id IN (
        SELECT gen.id FROM generic gen WHERE gen.category_id = ?
      )`;

        let orderBy = "";
        switch (typeOfSort) {
            case "priceDesc":
                orderBy = "ORDER BY products.base_price DESC";
                break;
            case "priceAsc":
                orderBy = "ORDER BY products.base_price ASC";
                break;
        }
        return paginationProducts(whereClause, [categoryId], page, limit, orderBy);

        // const [rows] = await pool.query(queryStr, [category_id, limit, offset]);
        // return { data: rows as Product[], totalPages }
    }

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
            // CÓ LỊCH SỬ: Chạy logic gợi ý theo lịch sử
            return this.getRecommendationsFromHistory(user_id);
        } else {
            // KHÔNG CÓ LỊCH SỬ: Chạy logic ngẫu nhiên
            return this.getRandomRecommendations();
        }
    }

    getRandomRecommendations = async () => {
        try {
            const [products] = await pool.query(
                `SELECT 
                    products.id, products.name, products.description, base_price, shop_id, image_url, sold_count, generic.name as category_name
                FROM 
                    products 
                JOIN 
                    productimages on productimages.product_id = products.id
                JOIN 
                    generic on generic.id = products.generic_id
                GROUP BY 
                    products.id
                ORDER BY RAND() 
                LIMIT 15`
            );
            return products;
        } catch (err) {
            console.log(err);
        }
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
            `SELECT DISTINCT category_id 
             FROM products 
             WHERE id IN (?)`,
            [productIds]
        );
        if (relatedCategoryIds.length === 0) {
            // Nếu không tìm thấy danh mục (lỗi), trả về ngẫu nhiên
            return this.getRandomRecommendations();
        }
        const categoryIds = relatedCategoryIds.map(row => row.category_id);

        // 3. Lấy sản phẩm TỪ CÁC DANH MỤC ĐÓ
        // (Và loại trừ sản phẩm đã xem)
        const [recommendations] = await pool.query(
            `SELECT * FROM products 
             WHERE 
                category_id IN (?) 
             AND 
                id NOT IN (?) 
             ORDER BY 
                RAND() 
             LIMIT 15`,
            [categoryIds, productIds]
        );

        return recommendations;
    }

    getProductsBySubCategoryService = async (subCategoryId: number, page: number = 1, limit: number = 10) => {
        const whereClause = `WHERE products.generic_id = ?`;
        return paginationProducts(whereClause, [subCategoryId], page, limit);
    };
}

export default new productService();
