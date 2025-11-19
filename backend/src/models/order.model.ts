import db from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ORDER_STATUS, canTransition } from '../constants/order-status';

export const findOrdersByShopId = async (shopId: number, status: string | undefined): Promise<RowDataPacket[]> => {
    let query = `
        SELECT DISTINCT o.* FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.shop_id = ?
    `;
    const params: (string | number)[] = [shopId];

    if (status) {
        query += ` AND o.status = ?`; 
        params.push(status);
    }

    query += ` ORDER BY o.order_date DESC;`;

    const [rows] = await db.execute(query, params);
    return rows as RowDataPacket[];
};

async function restoreProductStock(orderId: number) {
    await db.execute(`
        UPDATE productvariants pv
        JOIN order_items oi ON pv.id = oi.variant_id
        SET pv.stock = pv.stock + oi.quantity 
        WHERE oi.order_id = ?
    `, [orderId]);
}

export const updateOrderStatusByShop = async (
    orderId: number, 
    shopId: number, 
    newStatus: string,
    newPaymentStatus?: string 
): Promise<boolean> => {

    const [check] = await db.execute<RowDataPacket[]>(
        `SELECT 1 FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? AND p.shop_id = ? LIMIT 1`,
        [orderId, shopId]
    );
    if (check.length === 0) {
        throw new Error('Bạn không có quyền cập nhật đơn hàng này (Đơn không thuộc Shop).');
    }

    const [rows] = await db.execute<RowDataPacket[]>('SELECT status FROM orders WHERE order_id = ?', [orderId]);
    const currentStatus = rows[0]?.status as string;
    if (!currentStatus) throw new Error('Không tìm thấy đơn hàng.');

    if (!canTransition(currentStatus, newStatus)) {
        throw new Error(`Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}".`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED && currentStatus !== ORDER_STATUS.CANCELLED) {
        await restoreProductStock(orderId);
    }
    if (newPaymentStatus) {
        const [result] = await db.query<ResultSetHeader>(
            `UPDATE orders 
             SET status = ?, payment_status = ? 
             WHERE order_id = ?`, 
            [newStatus, newPaymentStatus, orderId]
        );
        return result.affectedRows > 0;
    } else {
        const [result] = await db.query<ResultSetHeader>(
            `UPDATE orders 
             SET status = ? 
             WHERE order_id = ?`,
            [newStatus, orderId]
        );
        return result.affectedRows > 0;
    }
};

export const findOrderById = async (orderId: number) => {
     const [rows] = await db.query<RowDataPacket[]>(
        `SELECT payment_method, payment_status FROM orders WHERE order_id = ?`, 
        [orderId]
    );
    return rows[0];
}

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

const getOrderItemsByShop = async (orderId: number, shopId: number) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT 
            oi.*, 
            p.name as product_name,
            (SELECT image_url FROM productimages WHERE product_id = p.id LIMIT 1) as product_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? AND p.shop_id = ?`,
        [orderId, shopId]
    );
    return rows;
};

export const findOrderDetailByShop = async (orderId: number, shopId: number) => {
    const [orderInfo, orderItems] = await Promise.all([
        getOrderBaseInfo(orderId, shopId),
        getOrderItemsByShop(orderId, shopId)
    ]);

    if (!orderInfo) {
        throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền xem.");
    }

    return { ...orderInfo, items: orderItems };
};