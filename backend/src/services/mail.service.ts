import nodemailer from "nodemailer";
import { ENV } from "../config/env";
import redisClient from "../redis/redisClient";

export async function sendOtpEmail(to: string) {
    // Validate email
    if (!to || !to.includes('@')) {
        throw new Error('Invalid email address');
    }

    // Validate environment variables
    if (!ENV.EMAIL_USER || !ENV.EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS not configured');
        throw new Error('Email service not configured. Please check environment variables.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`📧 Attempting to send OTP to: ${to}`);
    console.log(`📧 Using EMAIL_USER: ${ENV.EMAIL_USER}`);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: ENV.EMAIL_USER,
            pass: ENV.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Enable debug logs
        logger: true // Enable logger
    });

    // Verify transporter configuration
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified');
    } catch (verifyErr: any) {
        console.error('❌ SMTP verification failed:', verifyErr.message);
        throw new Error(`SMTP configuration error: ${verifyErr.message}`);
    }

    const mailOptions = {
        from: `"BáSàn" <${ENV.EMAIL_USER}>`,
        to,
        subject: "Mã OTP xác thực - BáSàn",
        text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0d6efd;">Xác thực tài khoản BáSàn</h2>
                <p>Mã OTP của bạn là:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0d6efd;">
                    ${otp}
                </div>
                <p style="color: #666; margin-top: 20px;">Mã này sẽ hết hạn sau 5 phút.</p>
                <p style="color: #666;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${to}`);
        console.log(`📧 Message ID: ${info.messageId}`);

        // Store OTP in Redis
        await redisClient.set(`otp:${to}`, otp, { EX: 300 });
        console.log(`✅ OTP stored in Redis for ${to}`);

        return { success: true, messageId: info.messageId };
    } catch (err: any) {
        console.error("❌ Error sending email:", {
            message: err.message,
            code: err.code,
            command: err.command,
            response: err.response,
            responseCode: err.responseCode
        });
        throw new Error(`Failed to send OTP email: ${err.message}`);
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