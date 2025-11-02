import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import shippingController from '../controllers/shipping.controller';

const router = Router();

// Route Frontend gọi để tính phí ship
// Nó sẽ gửi { street, ward, city } trong body
router.post(
    '/calculate',
    verifyToken, // Yêu cầu đăng nhập
    shippingController.calculateFee
);

export default router;