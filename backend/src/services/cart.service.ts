import pool from "../config/db"
import { ResultSetHeader } from 'mysql2'

class CartService {
    addToCartService = async (user_id: number, product_id: number, quantity: number) => {
        const sql = `
          INSERT INTO Cart (user_id, product_id, quantity, added_at)
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
        const sql = `
            SELECT 
                user_id, cart.product_id, products.base_price as product_price, products.name as product_name, quantity, shops.id as shop_id, shops.name as shop_name, image_url as product_url, logo_url
            FROM Cart 
            JOIN 
                products on products.id = cart.product_id 
            JOIN 
                shops on products.shop_id = shops.id
            JOIN 
                productimages on productimages.product_id = cart.product_id
            WHERE 
                user_id = ? AND isMain = 1`;
        const value = [user_id];

        try {
            const [row] = await pool.query(sql, value) as any[];
            return row;
        } catch (err) {
            console.log(err);
            throw new Error('Lỗi CSDL khi lấy giỏ hàng');
        }
    }

    updateProductQuantity = async (user_id: number, product_id: string, quantity: number) => {
        const sql = `
      UPDATE cart
      SET 
        quantity = ?,
        added_at = NOW() -- (Nên cập nhật cả thời gian)
      WHERE 
        user_id = ? AND product_id = ?;
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
}

export default new CartService();
