import { Request, Response } from "express";
import redisClient from "../redis/redisClient";
import { sendOtp } from "../services/speedsms.service";

export async function sendOtpController(req: Request, res: Response) {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Missing phone number" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await redisClient.setEx(`otp:${phone}`, 300, otp); // TTL = 5 phút
        await sendOtp(phone, otp);

        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
}

export async function verifyOtpController(req: Request, res: Response) {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Missing data" });

    try {
        const validOtp = await redisClient.get(`otp:${phone}`);

        if (validOtp && otp === validOtp) {
            await redisClient.del(`otp:${phone}`);
            return res.json({ success: true, message: "OTP verified" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch {
        res.status(500).json({ error: "OTP verification failed" });
    }
}
