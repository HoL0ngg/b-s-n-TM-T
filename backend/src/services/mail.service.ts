import nodemailer from "nodemailer";
import { ENV } from "../config/env";
import redisClient from "../redis/redisClient";

export async function sendOtpEmail(to: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: ENV.EMAIL_USER, // Gmail của bạn
            pass: ENV.EMAIL_PASS  // App password (không dùng mật khẩu thường)
        }
    });

    const mailOptions = {
        from: `"My App" <${ENV.EMAIL_USER}>`,
        to,
        subject: "Code OTP của bạn nè",
        text: `Mã OTP của bạn là: ${otp}. Hết hạn sau 5 phút nka.`,
    };

    await transporter.sendMail(mailOptions);
    try {
        await redisClient.set(`otp:${to}`, otp, { EX: 300 });
        console.log(`✅ OTP sent to ${to}`);
    } catch (err) {
        console.error("❌ Error sending email:", err);
        throw err;
    }
}

export const verifyOtpService = async (email: string, otp: string) => {
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp) {
        return { success: false, error: "OTP expired or not found" };
    }

    if (storedOtp !== otp) {
        return { success: false, error: "Invalid OTP" };
    }

    // Xoá OTP sau khi dùng thành công
    await redisClient.del(`otp:${email}`);

    return { success: true, message: "OTP verified successfully" };
};