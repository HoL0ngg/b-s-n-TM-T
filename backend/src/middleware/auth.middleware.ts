import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

const SECRET_KEY = ENV.JWT_SECRET;

export interface AuthUser {
    userId: string; // SĐT
    phone: string;
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Thiếu token" });

    try {
        const userPayload = jwt.verify(token, SECRET_KEY) as { id: string; shop_id?: number;[key: string]: any };
        (req as any).user = userPayload;
        const phone = userPayload.id;

        const [profileRows] = await pool.query(
            `SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, updated_at FROM user_profile WHERE phone_number = ?`,
            [phone]
        );

        if (Array.isArray(profileRows) && profileRows.length > 0) {
            (req as any).userProfile = profileRows[0];
        } else {
            (req as any).userProfile = null;
        }

        const [userRows] = await pool.query<RowDataPacket[]>(
            `SELECT role FROM users WHERE phone_number = ?`,
            [phone]
        );
        if (userRows.length === 0) {
            return res.status(401).json({ message: "Người dùng không tồn tại" });
        }
        (req as any).user.role = userRows[0].role;

        const [shopRows] = await pool.query<RowDataPacket[]>(
            `SELECT id FROM shops WHERE owner_id = ?`,
            [phone]
        );

        if (Array.isArray(shopRows) && shopRows.length > 0) {
            // Nếu tìm thấy shop, gán shop_id vào
            (req as any).user.shop_id = shopRows[0].id;
        } else {
            // Nếu user này không có shop (chỉ là người mua), gán là null
            (req as any).user.shop_id = null;
        }

        next(); // Cho đi tiếp

    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
}

export async function checkOptionalAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next();
    }

    try {
        const userPayload = jwt.verify(token, SECRET_KEY) as { id: string;[key: string]: any };
        const phone = userPayload.id;

        const user: Partial<AuthUser> = {
            userId: phone,
            phone: phone
        };
        (req as any).user = user;

        next();
    } catch (err) {
        return next();
    }
}

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Yêu cầu quyền Admin" });
    }
}

export function checkShopOwner(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user.role === 'shop_owner') {
        next();
    } else {
        res.status(403).json({ message: "Tài khoản không phải là chủ shop" });
    }
}