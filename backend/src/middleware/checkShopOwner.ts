// backend/src/middleware/checkShopOwner.ts
import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

interface ShopPayload {
    id: number;
    name: string;
    owner_id: string;
}

/**
 * Middleware này chạy SAU `verifyToken`.
 * Nó lấy user_id (phone_number) từ `req.user.id`
 * và tìm shop tương ứng mà user này làm chủ.
 * Nếu tìm thấy, nó sẽ gán thông tin shop vào `(req as any).shop`.
 * Nếu không, nó sẽ từ chối truy cập.
 */
export async function checkShopOwner(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as any).user;
        if (!user || !user.id) {
            return res.status(401).json({ message: "Yêu cầu xác thực (Không tìm thấy user)" });
        }

        const userPhone = user.id;

        // Tìm shop dựa trên owner_id (chính là phone_number của user)
        const [shopRows] = await pool.query(
            "SELECT id, name, owner_id FROM shops WHERE owner_id = ?",
            [userPhone]
        );

        if (!Array.isArray(shopRows) || shopRows.length === 0) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập. Bạn không phải là chủ shop." });
        }

        const shop = (shopRows as ShopPayload[])[0];

        // Gán thông tin shop vào request để các controller sau có thể sử dụng
        (req as any).shop = shop;

        next();

    } catch (err) {
        console.error("Lỗi tại middleware checkShopOwner:", err);
        return res.status(500).json({ message: "Lỗi máy chủ khi xác thực chủ shop" });
    }
}