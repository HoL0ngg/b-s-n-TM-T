import { Router } from 'express';
import {
    getShopOrdersController,
    updateShopOrderStatusController
} from '../controllers/order.controller';

// 1. Import middleware 'verifyToken' (chúng ta không cần 'authorizeAdmin' nữa)
// (Chúng ta đổi tên 'verifyToken' thành 'authenticateToken' cho rõ nghĩa)
import { verifyToken as authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 2. Áp dụng middleware xác thực cho TẤT CẢ các route bên dưới.
// Bất kỳ ai gọi API trong file này đều phải đăng nhập.
router.use(authenticateToken);

/* ========================================
 * == CÁC ROUTE CHO CHỦ SHOP (VENDOR) ==
 * ======================================== */

/**
 * @route   GET /api/shop/orders
 * @desc    [Shop] Lấy đơn hàng của Shop mình
 * @access  Private (Cần đăng nhập)
 */
router.get('/shop/orders', getShopOrdersController);

/**
 * @route   PUT /api/shop/orders/:orderId/status
 * @desc    [Shop] Cập nhật trạng thái 1 đơn hàng của Shop mình
 * @access  Private (Cần đăng nhập)
 */
router.put('/shop/orders/:orderId/status', updateShopOrderStatusController);

// 3. Xuất Router
export default router;