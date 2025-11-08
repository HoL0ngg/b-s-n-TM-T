import { Router } from "express";
import { checkOptionalAuth, verifyToken } from "../middleware/auth.middleware";
import paymentController from "../controllers/payment.controller";

const router = Router();

router.post('/vnpay', verifyToken, paymentController.createPayment_vnpay);
router.post('/momo', verifyToken, paymentController.createPayment_momo);    

export default router;