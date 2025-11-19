import { Request, Response } from "express";
import shopInfoService from "../services/shop.info.service";

export const shopController = {
// Method kiểm tra shop theo userId
getShopByUserId: async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const shop = await shopInfoService.getShopByUserId(userId);

    if (!shop) {
      // KHÔNG dùng 401 ở đây
      return res.status(200).json({ exists: false });
      // hoặc: return res.status(404).json({ message: "Shop not found" });
    }

    return res.status(200).json({ exists: true, shop });
  } catch (error: any) {
    console.error("LỖI KHI LẤY SHOP:", error);
    return res.status(500).json({ message: "Server error" });
  }
},

    registerShop: async (req: Request, res: Response) => {
        try {
            // (req as any).user.id (kiểu number) được lấy từ token
            console.log("hihhi");

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

        console.log('📝 Update request:', { shopId, userId, shopData });

        if (!shopId) {
            return res.status(400).json({ message: "shopId is required" });
        }

        // ✅ FIX: Query by shop_id instead of user_id
        const existingShop = await shopInfoService.getShopByShopId(shopId);
        
        if (!existingShop) {
            return res.status(404).json({ message: "Shop không tồn tại" });
        }

        // Check ownership
        if (existingShop.user_id !== userId) {
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