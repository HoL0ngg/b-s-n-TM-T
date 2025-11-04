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

    getCartByIdService = async (user_id: string) => {
        // --- QUERY 1: Lấy danh sách sản phẩm phẳng ---
        const sql_items = `
        SELECT 
            p.id AS product_id,
            ci.product_variant_id,
            ci.quantity,
            pv.price AS product_price,
            p.name AS product_name,
            s.id as shop_id,
            s.name as shop_name,
            s.logo_url,
            (SELECT pi.image_url FROM productimages pi 
             WHERE pi.product_id = p.id And ismain = 1) AS product_url
        FROM 
            cart ci
        JOIN 
            productvariants pv ON ci.product_variant_id = pv.id
        JOIN 
            products p ON pv.product_id = p.id
        JOIN 
            shops s ON p.shop_id = s.id
        WHERE 
            ci.user_id = ?;
    `;

        // 'flatItems' là mảng CartItem[] nhưng CHƯA CÓ 'options'
        const [flatItems] = await pool.query<CartItem[] & RowDataPacket[]>(sql_items, [user_id]);

        if (flatItems.length === 0) {
            return []; // Không có gì trong giỏ, trả về mảng rỗng
        }

        // --- Lấy ID của tất cả các biến thể cần tìm ---
        const variantIds = flatItems.map(item => item.product_variant_id);

        // --- QUERY 2: Lấy TẤT CẢ thuộc tính cho các ID đó ---
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
            vov.variant_id IN (?); -- (?) sẽ tự động mở rộng mảng [1, 2, 3]
    `;

        // 'optionRows' là mảng [ {variant_id: 1, ...}, {variant_id: 1, ...}, {variant_id: 2, ...} ]
        const [optionRows] = await pool.query<OptionRow[] & RowDataPacket[]>(sql_options, [variantIds]);

        // --- GOM NHÓM BẰNG JAVASCRIPT ---

        // 1. Tạo một Map để nhóm các thuộc tính
        const optionsMap = new Map<number, IVariantOption[]>();

        optionRows.forEach(opt => {
            const optionData = { attribute: opt.attribute, value: opt.value };

            if (!optionsMap.has(opt.variant_id)) {
                // Nếu chưa có, tạo một mảng mới cho variant_id này
                optionsMap.set(opt.variant_id, [optionData]);
            } else {
                // Nếu đã có, push vào mảng
                optionsMap.get(opt.variant_id)?.push(optionData);
            }
        });

        // 2. Gắn mảng 'options' đã nhóm vào 'flatItems'
        const finalCartItems = flatItems.map(item => {
            return {
                ...item,
                // Lấy mảng options từ Map, nếu không có thì trả về mảng rỗng
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
