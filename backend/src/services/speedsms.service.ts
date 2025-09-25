import axios from "axios";
import { ENV } from "../config/env";

const SPEEDSMS_API = "https://api.speedsms.vn/index.php/sms/send";
const ACCESS_TOKEN = ENV.SPEEDSMS_API_KEY;

export async function sendOtp(phone: string, otp: string) {
    try {
        const auth = Buffer.from(`${ACCESS_TOKEN}:x`).toString("base64"); // <-- quan trọng
        const response = await axios.post(
            SPEEDSMS_API,
            {
                to: [phone],
                content: `Ma OTP cua ban la: ${otp}`,
                sms_type: 2,
                sender: ""
            },
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(response.data);
        return response.data;
    } catch (err) {
        console.error("Error sending OTP:", err);
        throw err;
    }
}
