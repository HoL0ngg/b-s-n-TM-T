import { RowDataPacket } from 'mysql2';
import * as OrderModel from '../models/order.model';
import * as ShopModel from '../models/shop.model';
import pool from '../config/db';

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
            pagination: { page, limit, totalOrders, totalPages }
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
}

export default new OrderService();