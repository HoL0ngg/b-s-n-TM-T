// Đường dẫn: backend/src/middleware/checkShopOwner.ts
// (PHIÊN BẢN ĐÃ SỬA LỖI)

import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// Hàm này kiểm tra xem user (từ token) có phải là chủ shop không
export const checkShopOwner = async (req: Request, res: Response, next: NextFunction) => {
    
    // === BẮT ĐẦU SỬA LỖI ===
    // (Bỏ qua kiểm tra này cho các route 'Khuyến mãi' (GET)
    // vì chúng ta cần nó ở trang public, nhưng vẫn cần token)
    if (req.path.startsWith('/promotions') && req.method === 'GET') {
        return next();
    }
    // === KẾT THÚC SỬA LỖI ===

    try {
        const userId = (req as any).user?.id; // Lấy SĐT (string) từ verifyToken
        
        if (!userId) {
            return res.status(401).json({ message: "Token không hợp lệ hoặc thiếu (Lỗi 401)" });
        }

        // Tìm shop dựa trên SĐT (owner_id)
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id FROM shops WHERE owner_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            // (Thêm log này để bạn biết)
            console.error(`Lỗi checkShopOwner: User ${userId} không phải là chủ shop.`);
            
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền truy cập. Bạn không phải là chủ shop.' 
            });
        }

        const shop = rows[0];

        // Gán shop (bao gồm shop.id) vào request để các controller sau có thể dùng
        (req as any).shop = shop; 

        // Quan trọng: Phải gọi next() để đi tiếp
        next();

    } catch (error) {
        console.error('Lỗi nghiêm trọng trong middleware checkShopOwner:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ (Middleware)' });
    }
};