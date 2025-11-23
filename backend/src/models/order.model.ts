import db from '../config/db';
import { RowDataPacket } from 'mysql2/promise';

export const findOrdersByShopId = async (shopId: number, status: string | undefined): Promise<RowDataPacket[]> => {

    let query = `
        SELECT o.* FROM orders o
        WHERE o.shop_id = ?
    `;
    const params: (string | number)[] = [shopId];

    if (status) {
        query += ` AND LOWER(o.status) = LOWER(?)`;
        params.push(status);
    }

    query += ` ORDER BY o.order_date DESC;`;

    const [rows] = await db.execute(query, params);
    return rows as RowDataPacket[];
};

export const updateOrderStatusByShop = async (orderId: number, shopId: number, newStatus: string): Promise<boolean> => {
    const [result] = await db.execute(
        `UPDATE orders SET status = ? WHERE order_id = ? AND shop_id = ?`,
        [newStatus, orderId, shopId]
    );
    if ((result as any).affectedRows === 0) {
        throw new Error("Bạn không có quyền cập nhật đơn hàng này hoặc đơn hàng không tồn tại.");
    }
    return true;
};

/**
 * [Shop] Lấy thông tin cơ bản của 1 đơn hàng
 */
const getOrderBaseInfo = async (orderId: number, shopId: number) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM orders WHERE order_id = ? AND shop_id = ? LIMIT 1`,
        [orderId, shopId]
    );
    return rows[0];
};

/**
 * [Shop] Lấy các sản phẩm (items) trong 1 đơn hàng mà thuộc về Shop
 */
const getOrderItemsByShop = async (orderId: number, shopId: number) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT oi.* FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? AND p.shop_id = ?`,
        [orderId, shopId]
    );
    return rows;
};

/**
 * [Shop] Gộp thông tin đơn hàng và chi tiết sản phẩm
 */
export const findOrderDetailByShop = async (orderId: number, shopId: number) => {
    // Chạy song song 2 câu SQL
    const [orderInfo, orderItems] = await Promise.all([
        getOrderBaseInfo(orderId, shopId),
        getOrderItemsByShop(orderId, shopId)
    ]);

    if (!orderInfo) {
        throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền xem.");
    }

    return { ...orderInfo, items: orderItems };
};