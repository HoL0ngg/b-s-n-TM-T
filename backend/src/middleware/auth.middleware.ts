import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import pool from "../config/db";

const SECRET_KEY = ENV.JWT_SECRET;

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Thiếu token" });

    try {
        const userPayload = jwt.verify(token, SECRET_KEY) as { id: string;[key: string]: any };

        (req as any).user = userPayload;

        const phone = userPayload.id;
        console.log(userPayload);


        const [profileRows] = await pool.query(
            `SELECT username, gender, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, updated_at FROM user_profile WHERE phone_number = ?`,
            [phone]
        );

        if (Array.isArray(profileRows) && profileRows.length > 0) {
            (req as any).userProfile = profileRows[0];
        } else {
            (req as any).userProfile = null; // Hoặc một object rỗng {}
        }

        next();

    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
}