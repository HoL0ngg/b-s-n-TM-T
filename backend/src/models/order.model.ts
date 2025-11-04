import db from '../config/db';
import { RowDataPacket } from 'mysql2/promise';

/**
 * [Shop] Lấy danh sách các đơn hàng CÓ CHỨA sản phẩm của Shop
 *
 * Hàm này tìm tất cả các đơn hàng (orders)
 * nơi có ít nhất một sản phẩm (trong order_items)
 * thuộc về shop_id được cung cấp.
 */
export const findOrdersByShopId = async (shopId: number): Promise<RowDataPacket[]> => {
    // Câu lệnh SQL JOIN 4 bảng: orders -> order_items -> products -> shops
    // DISTINCT đảm bảo mỗi đơn hàng chỉ xuất hiện 1 lần
    const query = `
        SELECT DISTINCT o.* FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.shop_id = ?
        ORDER BY o.order_date DESC;
    `;
    
    const [rows] = await db.execute(query, [shopId]);
    return rows as RowDataPacket[];
};

/**
 * [Shop] Cập nhật trạng thái một đơn hàng
 *
 * Hàm này bao gồm 1 bước kiểm tra bảo mật:
 * Nó đảm bảo rằng shop (shopId) thực sự có sản phẩm trong đơn hàng (orderId)
 * trước khi cho phép cập nhật trạng thái.
 */
export const updateOrderStatusByShop = async (orderId: number, shopId: number, newStatus: string): Promise<boolean> => {
    
    // Bước 1: Kiểm tra quyền sở hữu
    // (Shop này có sản phẩm nào trong đơn hàng này không?)
    const checkQuery = `
        SELECT 1 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND p.shop_id = ?
        LIMIT 1;
    `;
    const [checkRows] = await db.execute(checkQuery, [orderId, shopId]);

    // Nếu không tìm thấy (kết quả = 0), ném lỗi
    if ((checkRows as RowDataPacket[]).length === 0) {
        throw new Error("Bạn không có quyền cập nhật đơn hàng này vì nó không chứa sản phẩm của bạn.");
    }

    // Bước 2: Nếu kiểm tra thành công, tiến hành cập nhật
    const [result] = await db.execute(
        `UPDATE orders SET status = ? WHERE order_id = ?`,
        [newStatus, orderId]
    );
    
    // Trả về true nếu cập nhật thành công (ảnh hưởng > 0 hàng)
    return (result as any).affectedRows > 0;
};