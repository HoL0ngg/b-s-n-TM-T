import { Request, Response } from "express";
import { loginAdminAccount } from "../services/auth.service";
import adminService from "../services/admin.service";

class AdminController {
    loginAdmin = async (req: Request, res: Response) => {
        try {
            const { sdt, password } = req.body;
            console.log(sdt, password);

            const { token, user } = await loginAdminAccount(sdt, password);

            res.json({ token, user });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
            console.log(error);

        }
    }

    getStats = async (req: Request, res: Response) => {
        try {
            // Lấy ngày từ query, nếu không có thì mặc định là tháng này
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            const startDate = (req.query.startDate as string) || startOfMonth;
            const endDate = (req.query.endDate as string) || endOfMonth;

            const chartType = (req.query.chartType as 'monthly' | 'daily') || 'monthly';

            // Gọi song song tất cả các service để tiết kiệm thời gian
            const [summary, topShops, topCustomers, bestProducts, worstProducts, revenueChart, recentOrders] = await Promise.all([
                adminService.getDashboardSummary(startDate, endDate),
                adminService.getTopShops(startDate, endDate),
                adminService.getTopCustomers(startDate, endDate),
                adminService.getTopProducts(startDate, endDate, 5, 'best'),
                adminService.getTopProducts(startDate, endDate, 5, 'worst'),
                adminService.getRevenueChartData(chartType),
                adminService.getRecentOrders()
            ]);

            res.json({
                range: { startDate, endDate },
                summary,
                topShops,
                topCustomers,
                bestProducts,
                worstProducts,
                revenueChart,
                recentOrders
            });

        } catch (error: any) {
            res.status(500).json({ message: "Lỗi lấy thống kê: " + error.message });
            console.log(error);

        }
    }
}

export default new AdminController();