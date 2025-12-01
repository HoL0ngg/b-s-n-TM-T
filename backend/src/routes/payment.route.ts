import { Router } from "express";
import { checkOptionalAuth, verifyToken } from "../middleware/auth.middleware";
import paymentController from "../controllers/payment.controller";

const router = Router();

router.post('/vnpay', verifyToken, paymentController.createOrder, paymentController.createPayment_vnpay);
router.post('/cod', verifyToken, paymentController.createOrder, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Thêm đơn hàng thành công"
    })
});
// router.post('/momo', verifyToken, paymentController.createPayment_momo);    
router.get('/vnpay/ipn', paymentController.handleIpn_vnpay);
export default router;