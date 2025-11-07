import pool from "../config/db"
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { CartItem, IVariantOption, OptionRow } from "../models/cart.model";

class CartService {
    addToCartService = async (user_id: number, product_id: number, quantity: number) => {
        const sql = `
          INSERT INTO Cart (user_id, product_variant_id, quantity, added_at)
          VALUES (?, ?, ?, NOW())
          ON DUPLICATE KEY 
          UPDATE
            quantity = quantity + ?, 
            added_at = NOW();
        `;

        const values = [user_id, product_id, quantity, quantity];

        try {
            const [result] = await pool.query(sql, values);
            return result;
        } catch (error) {
            console.error("Lỗi khi thêm vào Cart:", error);
            throw new Error('Lỗi CSDL khi cập nhật giỏ hàng');
        }
    }

    getCartByIdService = async (user_id: string): Promise<CartItem[]> => {

        // --- QUERY 1: Lấy danh sách sản phẩm (ĐÃ THÊM LOGIC GIẢM GIÁ) ---
        const sql_items = `
        SELECT 
            p.id AS product_id,
            ci.product_variant_id,
            ci.quantity,
            p.name AS product_name,
            s.id as shop_id,
            s.name as shop_name,
            s.logo_url,
            
            -- Lấy ảnh chính (isMain = 1)
            (SELECT pi.image_url FROM productimages pi 
             WHERE pi.product_id = p.id AND pi.is_main = 1 LIMIT 1) AS product_url,
            
            -- Lấy giá gốc
            pv.price AS original_price,
            
            -- Lấy % giảm giá (nếu có)
            pi.discount_value AS discount_percentage,
            
            -- Tính giá sale (nếu có)
            (CASE
                WHEN pi.discount_value IS NOT NULL 
                THEN ROUND(pv.price * (1 - (pi.discount_value / 100)))
                ELSE NULL 
            END) AS sale_price
            
        FROM 
            cart ci
        JOIN 
            productvariants pv ON ci.product_variant_id = pv.id
        JOIN 
            products p ON pv.product_id = p.id
        JOIN 
            shops s ON p.shop_id = s.id
            
        -- Dùng LEFT JOIN cho khuyến mãi (để vẫn lấy được SP không giảm giá)
        LEFT JOIN 
            promotion_items pi ON pv.id = pi.product_variant_id
        LEFT JOIN 
            promotions promo ON pi.promotion_id = promo.id
                             AND promo.is_active = 1
                             AND NOW() BETWEEN promo.start_date AND promo.end_date
        WHERE 
            ci.user_id = ?;
    `;

        // 'flatItems' bây giờ là mảng CartItem[] (đã có giá/sale, nhưng chưa có options)
        const [flatItems] = await pool.query<CartItem[] & RowDataPacket[]>(sql_items, [user_id]);

        if (flatItems.length === 0) {
            return []; // Không có gì trong giỏ, trả về mảng rỗng
        }

        // --- Lấy ID của tất cả các biến thể cần tìm (Code cũ của bạn, đã đúng) ---
        const variantIds = flatItems.map(item => item.product_variant_id);

        // --- QUERY 2: Lấy TẤT CẢ thuộc tính cho các ID đó (Code cũ của bạn, đã đúng) ---
        const sql_options = `
        SELECT
            vov.variant_id,
            pa.name AS attribute,
            vov.value
        FROM
            variantoptionvalues vov
        JOIN
            product_attributes pa ON vov.attribute_id = pa.id
        WHERE
            vov.variant_id IN (?);
    `;

        const [optionRows] = await pool.query<OptionRow[] & RowDataPacket[]>(sql_options, [variantIds]);

        // --- GOM NHÓM BẰNG JAVASCRIPT (Code cũ của bạn, đã đúng) ---

        // 1. Tạo Map để nhóm thuộc tính (đã tối ưu)
        const optionsMap = new Map<number, IVariantOption[]>();
        optionRows.forEach(opt => {
            const optionData = { attribute: opt.attribute, value: opt.value };
            if (!optionsMap.has(opt.variant_id)) {
                optionsMap.set(opt.variant_id, [optionData]);
            } else {
                optionsMap.get(opt.variant_id)?.push(optionData);
            }
        });

        // 2. Gắn mảng 'options' đã nhóm vào 'flatItems'
        const finalCartItems = flatItems.map(item => {
            return {
                ...item,
                options: optionsMap.get(item.product_variant_id) || []
            };
        });

        return finalCartItems;
    }

    updateProductQuantity = async (user_id: number, product_id: string, quantity: number) => {
        const sql = `
            UPDATE cart
            SET 
                quantity = ?,
                added_at = NOW() -- (Nên cập nhật cả thời gian)
            WHERE 
                user_id = ? AND product_variant_id = ?;
            `;

        // VALUES phải đúng thứ tự: [quantity, userId, productId]
        const values = [quantity, user_id, product_id];

        try {
            const [result] = await pool.query<ResultSetHeader>(sql, values);

            // Kiểm tra xem có hàng nào được cập nhật không
            if (result.affectedRows === 0) {
                throw new Error('Sản phẩm không có trong giỏ hàng hoặc dữ liệu không đổi');
            }

            return true;
        } catch (error) {
            console.error("Lỗi khi UPDATE GioHang:", error);
            throw new Error('Lỗi CSDL khi cập nhật số lượng');
        }
    }

    deleteProduct = async (user_id: number, product_id: string) => {
        const sql = `
            DELETE FROM cart
            WHERE 
                user_id = ? AND product_variant_id = ?;
            `;
        const value = [user_id, product_id];
        try {
            const [row] = await pool.query(sql, value) as any[];
            return row.length > 0;
        } catch (err) {
            console.log(err);
            throw new Error('Lỗi CSDL khi lấy giỏ hàng');
        }
    }

    deleteShop = async (user_id: number, shop_id: number) => {
        const sql = `
            DELETE 
                cart
            FROM 
                cart
            JOIN
                productvariants on cart.product_variant_id = productvariants.id
            JOIN
                products on products.id = productvariants.product_id
            WHERE 
                cart.user_id = ? AND products.shop_id = ?;
            `;
        const value = [user_id, shop_id];
        try {
            const [row] = await pool.query(sql, value) as any[];
            return row.length > 0;
        } catch (err) {
            console.log(err);
            throw new Error('Lỗi CSDL khi lấy giỏ hàng');
        }
    }
}

export default new CartService();
