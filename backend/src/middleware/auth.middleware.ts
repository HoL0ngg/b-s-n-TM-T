// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { ENV } from "../config/env";
// import pool from "../config/db";

// const SECRET_KEY = ENV.JWT_SECRET;

// export async function verifyToken(req: Request, res: Response, next: NextFunction) {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) return res.status(401).json({ message: "Thiếu token" });

//     try {
//         const userPayload = jwt.verify(token, SECRET_KEY) as { id: string;[key: string]: any };

//         (req as any).user = userPayload;

//         const phone = userPayload.id;

//         const [profileRows] = await pool.query(
//             `SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, updated_at FROM user_profile WHERE phone_number = ?`,
//             [phone]
//         );

//         if (Array.isArray(profileRows) && profileRows.length > 0) {
//             (req as any).userProfile = profileRows[0];
//         } else {
//             (req as any).userProfile = null; // Hoặc một object rỗng {}
//         }

//         next();

//     } catch (err) {
//         return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
//     }
// }

// export async function checkOptionalAuth(req: Request, res: Response, next: NextFunction) {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) {
//         return next();
//     }

//     try {
//         const userPayload = jwt.verify(token, SECRET_KEY) as {
//             id: string;[key: string]: any
//         };;

//         (req as any).user = userPayload;

//         next();

//     } catch (err) {
//         return next();
//     }
// }

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
// Bỏ import pool vì chúng ta không query CSDL ở đây nữa

const SECRET_KEY = ENV.JWT_SECRET;

// Interface chuẩn cho đối tượng user
export interface AuthUser {
    userId: string; // SĐT
    phone: string;
}

/**
 * HÀM 1: Xác thực Token (Sửa từ hàm của bạn)
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Thiếu token" });

    try {
        // 1. Giải mã token
        const userPayload = jwt.verify(token, SECRET_KEY) as { id: string; [key: string]: any };
        const phone = userPayload.id;

        // 2. [SỬA] Gắn đối tượng AuthUser (sạch) vào req.user
        const user: AuthUser = {
            userId: phone, // <-- Cung cấp 'userId' (string) mà Controller cần
            phone: phone
        };
        (req as any).user = user; 

        // 3. [LOẠI BỎ] Đã bỏ truy vấn đến user_profile để tăng tốc middleware

        next();
    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
}

/**
 * HÀM 2: Xác thực Tùy chọn (Sửa lại cho đúng)
 */
export async function checkOptionalAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next(); // Không có token, cho qua
    }

    try {
        const userPayload = jwt.verify(token, SECRET_KEY) as { id: string; [key: string]: any };
        const phone = userPayload.id;

        const user: Partial<AuthUser> = {
            userId: phone,
            phone: phone
        };
        (req as any).user = user;

        next();
    } catch (err) {
        return next(); // Token sai, vẫn cho qua
    }
}