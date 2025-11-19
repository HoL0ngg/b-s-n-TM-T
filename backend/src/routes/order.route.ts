import { Router } from 'express';
import { verifyToken as authenticateToken } from '../middleware/auth.middleware';
import orderController from '../controllers/order.controller';

const router = Router();
router.use(authenticateToken);

/* ========================================
 * == CÁC ROUTE CHO CHỦ SHOP (VENDOR) ==
 * ======================================== */

// 2. ROUTE CỤ THỂ (returns) PHẢI NẰM TRƯỚC
router.get('/shop/orders/returns', orderController.getShopReturnsController);

// Route cho danh sách chung
router.get('/shop/orders', orderController.getShopOrdersController);

// Route cho cập nhật status
router.put('/shop/orders/:orderId/status', orderController.updateShopOrderStatusController);

// 3. ROUTE ĐỘNG (với :orderId) PHẢI NẰM CUỐI CÙNG
router.get('/shop/orders/:orderId', orderController.getShopOrderDetailController);

router.get('/orders', orderController.getAllOrder);
router.get('/orders/:id', orderController.getDetailOrder);
export default router;