import pool from "../config/db";
import { Product, ProductReview, ProductDetails, AttributeOfProductVariants } from "../models/product.model";

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
}

export default new productService();