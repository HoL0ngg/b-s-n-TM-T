import db from '../config/db';
import { RowDataPacket } from 'mysql2/promise';

export const findOrdersByShopId = async (shopId: number, status: string | undefined): Promise<RowDataPacket[]> => {

    let query = `
        SELECT DISTINCT o.* FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.shop_id = ?
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
    const checkQuery = `
        SELECT 1 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND p.shop_id = ?
        LIMIT 1;
    `;
    const [checkRows] = await db.execute(checkQuery, [orderId, shopId]);
    if ((checkRows as RowDataPacket[]).length === 0) {
        throw new Error("Bạn không có quyền cập nhật đơn hàng này vì nó không chứa sản phẩm của bạn.");
    }
    const [result] = await db.execute(
        `UPDATE orders SET status = ? WHERE order_id = ?`,
        [newStatus, orderId]
    );
    return (result as any).affectedRows > 0;
};

/**
 * [Shop] Lấy thông tin cơ bản của 1 đơn hàng
 */
const getOrderBaseInfo = async (orderId: number, shopId: number) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT o.* FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.order_id = ? AND p.shop_id = ?
         LIMIT 1`,
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