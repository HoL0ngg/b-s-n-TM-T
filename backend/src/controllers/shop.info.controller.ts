import { Request, Response } from "express";
import shopInfoService from "../services/shop.info.service"; 

export const shopController = {
  
  // Method này giữ nguyên, dùng để lấy info shop BẤT KỲ bằng SĐT
  // (Lấy phiên bản code của bạn (qhuykuteo) vì có bình luận rõ ràng)
  getShopByUserId: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params; // userId này là SĐT (string)
      
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

  // Method này đã được sửa để gọi service transaction
  // (Lấy phiên bản code của bạn (qhuykuteo) vì đã nâng cấp)
  registerShop: async (req: Request, res: Response) => {
    try {
      // (req as any).user.id là SỐ ĐIỆN THOẠI (string) từ auth.middleware.ts
      const userId = (req as any).user?.id; 
      const shopData = req.body;

      if (!userId || typeof userId !== 'string') {
        throw new Error("Không tìm thấy ID người dùng (phone) từ token.");
      }

      // Truyền userId (string) vào service (đã được sửa)
      await shopInfoService.createShop(shopData, userId);
      
      res.status(201).json({ message: "Tạo shop thành công!" });
      
    } catch (error: any) {
      console.error("LỖI KHI TẠO SHOP:", error);
      // Gửi lỗi từ service (VD: "Tên shop đã tồn tại")
      res.status(400).json({ message: error.message });
    }
  },

  // Method này giữ nguyên, nó đã tương thích với service mới
  // (Lấy phiên bản code của bạn (qhuykuteo) vì đã nâng cấp)
  updateShop: async (req: Request, res: Response) => {
    try {
      const { shopId } = req.params; // Đây là ID (number) của bảng shop_info
      const userId = (req as any).user.id; // Đây là SĐT (string) của user
      const shopData = req.body;

      if (!shopId) {
        return res.status(400).json({ message: "shopId is required" });
      }

      // Kiểm tra shop có thuộc user này không
      const existingShop = await shopInfoService.getShopByUserId(userId);
      if (!existingShop || existingShop.id !== parseInt(shopId)) {
        return res.status(403).json({ message: "Bạn không có quyền cập nhật shop này" });
      }

      // Gọi service (đã được sửa để chạy transaction)
      await shopInfoService.updateShop(parseInt(shopId), shopData);
      
      res.json({ message: "Cập nhật shop thành công!" });
      
    } catch (error: any) {
      console.error("LỖI KHI CẬP NHẬT SHOP:", error);
      res.status(400).json({ message: error.message });
    }
  }
};