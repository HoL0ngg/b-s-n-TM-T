import { Request, Response } from "express";
import shopInfoService from "../services/shop.info.service";

export const shopController = {

    // Method kiểm tra shop theo userId
    getShopByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ message: "userId is required" });
            }

            const shop = await shopInfoService.getShopByUserId(userId);

            // Trả về shop hoặc null
            res.json(shop);

        } catch (error: any) {
            console.error("LỖI KHI LẤY THÔNG TIN SHOP:", error);
            res.status(500).json({
                message: "Lỗi khi kiểm tra thông tin shop",
                error: error.message
            });
        }
    },

    registerShop: async (req: Request, res: Response) => {
        try {
            // (req as any).user.id (kiểu number) được lấy từ token
            const userId = (req as any).user.id;
            const shopData = req.body;

            if (!userId) {
                throw new Error("Không tìm thấy ID người dùng từ token.");
            }

            // Truyền userId (number) vào service
            await shopInfoService.createShop(shopData, userId);

            res.status(201).json({ message: "Tạo shop thành công!" });

        } catch (error: any) {
            console.error("LỖI KHI TẠO SHOP:", error);
            res.status(400).json({ message: error.message });
        }
    },
    // Thêm vào shopController
    updateShop: async (req: Request, res: Response) => {
        try {
            const { shopId } = req.params;
            const userId = (req as any).user.id;
            const shopData = req.body;

            if (!shopId) {
                return res.status(400).json({ message: "shopId is required" });
            }

            // Kiểm tra shop có thuộc user này không
            const existingShop = await shopInfoService.getShopByUserId(userId);
            if (!existingShop || existingShop.id !== parseInt(shopId)) {
                return res.status(403).json({ message: "Bạn không có quyền cập nhật shop này" });
            }

            await shopInfoService.updateShop(parseInt(shopId), shopData);

            res.json({ message: "Cập nhật shop thành công!" });

        } catch (error: any) {
            console.error("LỖI KHI CẬP NHẬT SHOP:", error);
            res.status(400).json({ message: error.message });
        }
    }
};