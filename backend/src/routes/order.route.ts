import { Router } from 'express';
import {
    getShopOrdersController,
    updateShopOrderStatusController,
    getShopOrderDetailController,
    getShopReturnsController
} from '../controllers/order.controller';
import { verifyToken as authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

/* ========================================
 * == CÁC ROUTE CHO CHỦ SHOP (VENDOR) ==
 * ======================================== */

// 2. ROUTE CỤ THỂ (returns) PHẢI NẰM TRƯỚC
router.get('/shop/orders/returns', getShopReturnsController);

// Route cho danh sách chung
router.get('/shop/orders', getShopOrdersController);

// Route cho cập nhật status
router.put('/shop/orders/:orderId/status', updateShopOrderStatusController);

// 3. ROUTE ĐỘNG (với :orderId) PHẢI NẰM CUỐI CÙNG
router.get('/shop/orders/:orderId', getShopOrderDetailController);
export default router;