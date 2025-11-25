import { RowDataPacket } from "mysql2";
import pool from "../config/db";

class AdminService {
    async getTopShops(startDate: string, endDate: string, limit: number = 10) {
        const sql = `
            SELECT 
                s.id, 
                s.name, 
                s.logo_url,
                COUNT(o.order_id) as total_orders,
                SUM(o.total_amount) as total_revenue
            FROM shops s
            JOIN orders o ON s.id = o.shop_id
            WHERE 
                o.status = 'delivered' -- Chỉ tính đơn thành công
                AND o.order_date BETWEEN ? AND ?
            GROUP BY s.id
            ORDER BY total_revenue DESC -- Sắp xếp theo doanh thu
            LIMIT ?;
        `;

        const [rows] = await pool.query<RowDataPacket[]>(sql, [startDate, endDate, limit]);
        return rows;
    }

    // --- 2. THỐNG KÊ KHÁCH HÀNG (MUA NHIỀU NHẤT) ---
    async getTopCustomers(startDate: string, endDate: string, limit: number = 10) {
        const sql = `
            SELECT 
                u.phone_number,
                u.avatar_url,
                COUNT(o.order_id) as total_orders,
                SUM(o.total_amount) as total_spent
            FROM users u
            JOIN orders o ON u.phone_number = o.user_id
            WHERE 
                o.status = 'delivered'
                AND o.order_date BETWEEN ? AND ?
            GROUP BY u.phone_number
            ORDER BY total_spent DESC -- Sắp xếp theo số tiền chi tiêu
            LIMIT ?;
        `;

        const [rows] = await pool.query<RowDataPacket[]>(sql, [startDate, endDate, limit]);
        return rows;
    }

    // --- 3. THỐNG KÊ SẢN PHẨM (BÁN CHẠY NHẤT) ---
    async getTopProducts(startDate: string, endDate: string, limit: number = 10, type: 'best' | 'worst' = 'best') {
        const orderBy = type === 'best' ? 'DESC' : 'ASC';

        const sql = `
            SELECT 
                p.id,
                p.name,
                p.base_price,
                (SELECT image_url FROM productimages WHERE product_id = p.id AND is_main = 1 LIMIT 1) as image_url,
                s.name as shop_name,
                COALESCE(SUM(oi.quantity), 0) as total_sold_quantity,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue_generated
            FROM products p
            JOIN shops s ON p.shop_id = s.id
            -- Left Join để lấy cả sản phẩm chưa bán được (cho mục 'bán ế')
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
                AND o.status = 'delivered' 
                AND o.order_date BETWEEN ? AND ?
            
            GROUP BY p.id
            
            -- Mấu chốt để lọc bán chạy/bán ế
            ORDER BY total_sold_quantity ${orderBy} 
            LIMIT ?;
        `;

        const [rows] = await pool.query<RowDataPacket[]>(sql, [startDate, endDate, limit]);
        return rows;
    }

    // --- 4. THỐNG KÊ TỔNG QUAN (DASHBOARD CARDS) ---
    async getDashboardSummary(startDate: string, endDate: string) {
        // Lấy tổng doanh thu sàn, tổng đơn, tổng user mới...
        const sql = `
            SELECT
                (SELECT IFNULL(SUM(total_amount), 0) FROM orders WHERE status = 'delivered' AND order_date BETWEEN ? AND ?) as revenue,
                (SELECT COUNT(*) FROM orders WHERE order_date BETWEEN ? AND ?) as orders,
                (SELECT COUNT(*) FROM users WHERE created_at BETWEEN ? AND ?) as new_users,
                (SELECT COUNT(*) FROM shops WHERE created_at BETWEEN ? AND ?) as new_shops
        `;
        const params = [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate];
        const [rows] = await pool.query<RowDataPacket[]>(sql, params);
        return rows[0];
    }

    async getRevenueChartData(type: 'monthly' | 'daily' = 'monthly') {
        let sql = "";
        let params: any[] = [];

        if (type === 'monthly') {
            // --- LOGIC THEO THÁNG (Trong năm nay) ---
            sql = `
                SELECT 
                    MAX(CONCAT('Thg ', MONTH(order_date))) as name, -- Tên: "Thg 1", "Thg 2"
                    MONTH(order_date) as month_num,            -- Để sắp xếp
                    SUM(total_amount) as revenue,              -- Tổng doanh thu
                    COUNT(order_id) as orders                        -- Tổng số đơn
                FROM orders
                WHERE 
                    status = 'delivered'                       -- Chỉ tính đơn thành công
                    AND YEAR(order_date) = YEAR(NOW())         -- Chỉ lấy năm nay
                GROUP BY 
                    MONTH(order_date)
                ORDER BY 
                    month_num ASC;
            `;
        } else {
            // --- LOGIC THEO NGÀY (7 ngày gần nhất) ---
            sql = `
                SELECT 
                    DATE_FORMAT(order_date, '%d/%m') as name,  -- Tên: "19/11"
                    DATE(order_date) as date_val,              -- Để sắp xếp
                    SUM(total_amount) as revenue,
                    COUNT(order_id) as orders
                FROM orders
                WHERE 
                    status = 'delivered'
                    AND order_date >= DATE(NOW()) - INTERVAL 6 DAY -- 7 ngày qua (tính cả hôm nay)
                GROUP BY 
                    DATE(order_date)
                ORDER BY 
                    date_val ASC;
            `;
        }

        const [rows] = await pool.query<RowDataPacket[]>(sql, params);

        return rows;
    }

    async getRecentOrders() {
        const sql = `
            SELECT 
                o.order_id, 
                o.order_date as created_at, 
                o.total_amount as total,
                o.status,
                u.phone_number as customer,
                u.avatar_url as customer_avatar,
                s.name as shop_name
            FROM orders o
            JOIN users u ON o.user_id = u.phone_number
            JOIN shops s ON o.shop_id = s.id
            ORDER BY o.order_date DESC
            LIMIT 5;
        `;

        const [rows] = await pool.query<RowDataPacket[]>(sql);
        return rows;
    }
}

export default new AdminService();