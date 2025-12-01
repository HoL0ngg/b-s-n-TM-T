import { ResultSetHeader, RowDataPacket } from 'mysql2';
import * as OrderModel from '../models/order.model';
import * as ShopModel from '../models/shop.model';
import pool from '../config/db';
import { VALID_TRANSITIONS } from '../constants/order-status';
import cartService from './cart.service';

class OrderService {
    getOrdersForShop = async (userId: string, status: string | undefined) => {
        const shopId = await ShopModel.findShopIdByOwner(userId);
        if (!shopId) {
            throw new Error("Người dùng này không sở hữu Shop nào.");
        }
        return OrderModel.findOrdersByShopId(shopId, status);
    };

    updateOrderStateByShop = async (userId: string, orderId: number, newStatus: string) => {
        const shopId = await ShopModel.findShopIdByOwner(userId);
        if (!shopId) {
            throw new Error("Người dùng này không sở hữu Shop nào.");
        }

        // Get current order status to validate transition
        const orderDetail: any = await OrderModel.findOrderDetailByShop(orderId, shopId);
        const currentStatus = orderDetail.status;

        // Validate transition
        const allowedTransitions = VALID_TRANSITIONS[currentStatus];

        // Allow same status update (idempotent) or check valid transition
        if (currentStatus !== newStatus) {
            if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
                throw new Error(`Không thể chuyển trạng thái từ '${currentStatus}' sang '${newStatus}'.`);
            }
        }

        return OrderModel.updateOrderStatusByShop(orderId, shopId, newStatus);
    };

    /**
     * [Shop] Lấy chi tiết 1 đơn hàng
     */
    getOrderDetailForShop = async (userId: string, orderId: number) => {
        const shopId = await ShopModel.findShopIdByOwner(userId);
        if (!shopId) {
            throw new Error("Người dùng này không sở hữu Shop nào.");
        }
        return OrderModel.findOrderDetailByShop(orderId, shopId);
    };

    async getAllOrders(page: number, limit: number, status?: string, search?: string, shopId?: number) {
        const offset = (page - 1) * limit;
        const params: any[] = [];

        let whereSql = "WHERE 1=1";

        // Lọc theo trạng thái
        if (status && status !== 'all') {
            whereSql += " AND o.status = ?";
            params.push(status);
        }

        // Tìm kiếm (Mã đơn, Tên khách)
        if (search) {
            whereSql += " AND (o.order_id LIKE ? OR u.phone_number LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        // Lọc theo Shop (nếu cần)
        if (shopId) {
            whereSql += " AND o.shop_id = ?";
            params.push(shopId);
        }

        // Truy vấn đếm tổng (cho phân trang)
        const countSql = `
            SELECT COUNT(*) as total 
            FROM orders o 
            JOIN users u ON o.user_id = u.phone_number 
            ${whereSql}
        `;
        const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
        const totalOrders = countRows[0].total;
        const totalPages = Math.ceil(totalOrders / limit);

        const revenueSql = `
            SELECT SUM(total_amount) as total_revenue
            FROM orders             
            WHERE shop_id = ?
        `;
        type TotalRevenue = { total_revenue: string | number };
        const [revenueRows] = await pool.query<TotalRevenue[] & RowDataPacket[]>(revenueSql, [shopId]);
        const totalRevenue = revenueRows[0].total_revenue || 0;

        // Truy vấn lấy dữ liệu
        const dataSql = `
            SELECT                 
                o.order_id, o.order_date, o.total_amount, o.status, o.payment_method,
                u.phone_number as customer_phone, u.avatar_url, u.email as custmer_email,
                s.name as shop_name
            FROM orders o
            JOIN users u ON o.user_id = u.phone_number
            JOIN shops s ON o.shop_id = s.id
            ${whereSql}
            ORDER BY o.order_date DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query<RowDataPacket[]>(dataSql, [...params, limit, offset]);
        return {
            data: rows,
            pagination: { page, limit, totalOrders, totalPages, totalRevenue }
        };
    }

    async getOrderDetails(orderId: number) {
        // Lấy thông tin chung
        const [orderRows] = await pool.query<RowDataPacket[]>(`
            SELECT o.*, u.phone_number, u.email as customer_email, s.name as shop_name, u.avatar_url as customer_avatar, CONCAT(ad.street, ', ', ad.ward, ', ', ad.city) as shipping_address
            FROM orders o
            JOIN users u ON o.user_id = u.phone_number
            JOIN shops s ON o.shop_id = s.id
            JOIN address ad ON o.address_id = ad.id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orderRows.length === 0) throw new Error("Không tìm thấy đơn hàng");
        const order = orderRows[0];

        // Lấy danh sách sản phẩm
        const [items] = await pool.query<RowDataPacket[]>(`
            SELECT oi.*, p.name as product_name, pi.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN productimages pi ON p.id = pi.product_id
            WHERE oi.order_id = ? AND pi.is_main = 1
        `, [orderId]);

        return { ...order, items };
    }

    addOrders = async (userId, shopOrders, opts) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const needed = new Map();
            for (const shopOrder of shopOrders) {
                for (const item of shopOrder.items) {
                    const variant_id = Number(item.variant_id);
                    const quantity = Number(item.quantity);
                    needed.set(variant_id, (needed.get(variant_id) || 0) + quantity);
                }
            }

            const variantIds = Array.from(needed.keys());

            // Khoá productVariantRows
            const placeholders = variantIds.map(() => '?').join(',');

            const [prodRows] = await connection.query<RowDataPacket[]>(
                `SELECT id, stock FROM productvariants WHERE id IN (${placeholders}) FOR UPDATE`,
                variantIds
            );

            const stockMap = new Map();
            for (const row of prodRows) {
                stockMap.set(Number(row.id), Number(row.stock));
            }

            const insufficient: {
                variantId: Number,
                stock: Number,
                needed: Number
            }[] = [];

            for (const [variantId, needQuantity] of needed.entries()) {
                const avail = stockMap.has(variantId) ? stockMap.get(variantId) : null;
                if (avail === null || avail < needQuantity) {
                    insufficient.push({
                        variantId: variantId,
                        stock: avail === null ? 0 : avail,
                        needed: needQuantity
                    })
                }
            }

            if (insufficient.length > 0) {
                const error = new Error(`Không đủ sản phẩm`);
                (error as any).status = 409;
                (error as any).details = insufficient;
                throw error;
            }

            const orderIds: number[] = [];

            for (const shopOrder of shopOrders) {
                const [orderResult]: any = await connection.execute(
                    `
                    INSERT INTO orders
                    (user_id, shop_id, total_amount, address_id, shipping_fee, status, payment_method, payment_status, notes, order_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    `,
                    [userId, shopOrder.shop_id, shopOrder.total_amount, opts.address_id, shopOrder.shipping_fee, `Pending`, opts.payment_method ?? "cod", `Unpaid`, opts.notes ?? null]
                );

                const orderId = orderResult.insertId;
                orderIds.push(orderId);

                for (const item of shopOrder.items) {
                    const subTotal = item.price_at_purchase * item.quantity;
                    await connection.execute(
                        `
                        INSERT INTO order_items
                        (order_id, product_id, variant_id, product_name, quantity, price_at_purchase, subtotal)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        `,
                        [orderId, item.product_id, item.variant_id, item.product_name, item.quantity, item.price_at_purchase, subTotal]
                    );
                }
            }

            for (const [variantId, needQuantity] of needed.entries()) {
                const prev = stockMap.get(variantId);
                const newStock = prev - needQuantity;
                await connection.execute(
                    `UPDATE productvariants SET stock = ? WHERE id = ?`,
                    [newStock, variantId]
                );
            }

            // Xóa các sản phẩm đã đặt khỏi giỏ hàng
            const variantIdsToDelete = Array.from(needed.keys());
            await cartService.deleteCartItems(userId, variantIdsToDelete);

            await connection.commit();
            return orderIds;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    restoreStock = async (orderIds) => {
        if (!orderIds || orderIds.length === 0) return;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [aggRows] = await conn.query<RowDataPacket[]>(
                `SELECT variant_id, SUM(quantity) AS sumQty
                 FROM order_items
                 WHERE order_id IN (?)
                 GROUP BY variant_id
                `,
                [orderIds]
            );
            if (!aggRows.length) {
                await conn.commit();
                return;
            }

            const variantIds = aggRows.map(r => r.variant_id);

            const [locked] = await conn.query<RowDataPacket[]>(
                `SELECT id FROM productvariants WHERE id in (?) FOR UPDATE`,
                [variantIds]
            );

            if (!locked.length) {
                await conn.rollback();
                throw new Error("Không tìm thấy variant products");
            }

            const cases: string[] = [];
            const params: Array<number> = [];

            for (const r of aggRows) {
                const qty = Number(r.sumQty) || 0;
                const id = Number(r.variant_id);
                cases.push(`WHEN id = ? THEN stock + ?`);
                params.push(id, qty);
            }

            const sql = `
                UPDATE productvariants
                SET stock = CASE ${cases.join(" ")} ELSE stock END
                where id IN (?);
            `;

            await conn.query(sql, [...params, variantIds]);
            await conn.commit();

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
    updateOrderPaymentStatus = async (orderId, newPaymentStatus) => {
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE orders SET payment_status = ? WHERE order_id = ?`,
            [newPaymentStatus, orderId]
        );
        return result.affectedRows > 0;
    }

    getUserOrder = async (userId: string, page: number, limit: number, status?: string) => {
        const offset = (page - 1) * limit;

        const params: any[] = [userId];
        let whereSql = "WHERE o.user_id = ?";

        // Lọc theo trạng thái
        if (status && status !== 'all') {
            whereSql += " AND o.status = ?";
            params.push(status);
        }
        // Truy vấn đếm tổng (cho phân trang)
        const countSql = `
            SELECT COUNT(*) as total
            FROM orders o
            ${whereSql}
        `;
        const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
        const totalOrders = countRows[0].total;
        const totalPages = Math.ceil(totalOrders / limit);
        // Truy vấn lấy dữ liệu
        const dataSql = `
            SELECT
                o.order_id, o.order_date, o.total_amount, o.status, o.payment_method, o.payment_status,
                s.name as shop_name
            FROM orders o
            JOIN shops s ON o.shop_id = s.id
            ${whereSql}
            ORDER BY o.order_date DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(dataSql, [...params, limit, offset]);
        const result = {
            orders: rows,
            pagination: { page, limit, totalOrders, totalPages }
        };
        return result;
    }

    cancelOrderByUser = async (userId: string, orderId: number) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check order ownership and status
            const [rows] = await connection.query<RowDataPacket[]>(
                `SELECT status FROM orders WHERE order_id = ? AND user_id = ? FOR UPDATE`,
                [orderId, userId]
            );

            if (rows.length === 0) {
                throw new Error("Đơn hàng không tồn tại hoặc không thuộc về bạn.");
            }

            const currentStatus = rows[0].status;
            if (currentStatus.toLowerCase() !== 'pending') {
                throw new Error("Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận.");
            }

            // Update status
            await connection.execute(
                `UPDATE orders SET status = 'Cancelled' WHERE order_id = ?`,
                [orderId]
            );

            // Restore stock
            const [items] = await connection.query<RowDataPacket[]>(
                `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
                [orderId]
            );

            for (const item of items) {
                await connection.execute(
                    `UPDATE productvariants SET stock = stock + ? WHERE id = ?`,
                    [item.quantity, item.variant_id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    confirmOrderReceived = async (userId: string, orderId: number) => {
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE orders SET status = 'Delivered', payment_status = 'Paid' WHERE order_id = ? AND user_id = ? AND status = 'Shipping'`,
            [orderId, userId]
        );
        if (result.affectedRows === 0) {
            throw new Error("Không thể xác nhận đơn hàng (có thể đơn hàng chưa được giao hoặc không tồn tại).");
        }
        return true;
    }
}
export default new OrderService();