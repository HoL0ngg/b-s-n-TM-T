import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import shippingController from '../controllers/shipping.controller';

const shippingRouter = Router();

// Route Frontend gọi để tính phí ship
// Nó sẽ gửi { street, ward, city } trong body
shippingRouter.post(
    '/',
    verifyToken, // Yêu cầu đăng nhập
    shippingController.calculateFee
);

export default shippingRouter;