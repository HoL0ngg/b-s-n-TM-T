import express from 'express';
import { shopController } from '../controllers/shop.info.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Route kiểm tra shop - ĐẶT TRƯỚC các route khác
router.get('/user/:userId', shopController.getShopByUserId);

router.post('/register', verifyToken, shopController.registerShop); // Add verifyToken here too
router.put('/update/:shopId', verifyToken, shopController.updateShop); // Changed from /update/:shopId

export default router;