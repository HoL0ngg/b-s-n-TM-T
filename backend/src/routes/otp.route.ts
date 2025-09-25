import { Router } from "express";
import { sendOtpController, verifyOtpController } from "../controllers/otp.controller";

const router = Router();

router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;
