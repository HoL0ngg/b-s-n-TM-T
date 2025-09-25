import { Router } from "express";
import { sendOtpController, verifyOtpController } from "../controllers/mail.controller";

const router = Router();
router.post("/send-otp", sendOtpController);
router.post("/verify", verifyOtpController);
export default router;