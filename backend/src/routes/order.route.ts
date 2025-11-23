import { Router } from 'express';
import { verifyToken as authenticateToken, verifyToken } from '../middleware/auth.middleware';
import orderController from '../controllers/order.controller';

const router = Router();
router.use(authenticateToken);

/* ========================================
 * == CÁC ROUTE CHO CHỦ SHOP (VENDOR) ==
 * ======================================== */

// 2. ROUTE CỤ THỂ (returns) PHẢI NẰM TRƯỚC
router.get('/shop/returns', orderController.getShopReturnsController);

// Route cho danh sách chung
router.get('/shop', orderController.getShopOrdersController);

// Route cho cập nhật status
router.put('/shop/:orderId/status', orderController.updateShopOrderStatusController);

// 3. ROUTE ĐỘNG (với :orderId) PHẢI NẰM CUỐI CÙNG
router.get('/shop/:orderId', orderController.getShopOrderDetailController);

router.get('/order', orderController.getShopOrdersController);
router.get('/', orderController.getAllOrder);
router.get('/user', verifyToken, orderController.getUserOrder);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);
router.put('/:id/confirm', verifyToken, orderController.confirmReceived);
router.put('/:id/payment-status', verifyToken, orderController.updatePaymentStatus);
router.get('/:id', orderController.getDetailOrder);
export default router;