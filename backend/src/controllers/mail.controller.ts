import { sendOtpEmail, verifyOtpService } from "../services/mail.service";
import { Request, Response } from "express";

export async function sendOtpController(req: Request, res: Response) {
    const { email } = req.body;

    try {
        await sendOtpEmail(email);
        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to send OTP" , message: JSON.stringify(error, null, 2)});
    }
}

export const verifyOtpController = async (req: Request, res: Response) => {
    try {
        const { email, otpCode } = req.body;

        const result = await verifyOtpService(email, otpCode);
        console.log(result);

        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};
