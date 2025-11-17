import { Request, Response } from "express";
import shopService from "../services/shop.service";

class ShopController {
    async getShopOnIdController(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const type = req.query.type?.toString() || "";

            if (type) {
                const tmp = await shopService.getShopCateOnIdService(id, type);
                return res.status(200).json(tmp);
            }

            const data = await shopService.getShopOnIdService(id);
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getShopByOwnerController(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId;
            const shop = await shopService.getShopByOwnerService(ownerId);

            if (!shop) {
                return res.status(404).json({ error: "Shop not found" });
            }

            res.status(200).json(shop);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getHotShops(req: Request, res: Response) {
        try {
            const data = await shopService.getHotShops();
            res.status(200).json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    async getVariants(req: Request, res: Response) {
        try {
            const shopId = Number(req.params.id);
            const variants = await shopService.getAllVariantsByShopId(shopId);
            res.status(200).json(variants);
        } catch (error) {
            console.error("Lỗi lấy danh sách biến thể:", error);
            res.status(500).json({ message: "Lỗi máy chủ khi tải danh sách sản phẩm" });
        }
    }

    async createShopController(req: Request, res: Response) {
        try {
            console.log('📦 Received create shop request:', req.body);
            const { name, logo_url, description, status, owner_id } = req.body;

            if (!name || !owner_id) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: name và owner_id' });
            }

            const shopId = await shopService.createShopService(
                name,
                logo_url || '/assets/shops/default-shop.png',
                description || '',
                status || 1,
                owner_id
            );

            console.log('✅ Shop created with ID:', shopId);
            res.status(201).json({ shopId, message: 'Shop created successfully' });

        } catch (error: any) {
            console.error('❌ Error creating shop:', error);
            res.status(500).json({ message: 'Error creating shop', error: error.message });
        }
    }

    async updateShopController(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const { name, logo_url, description, status } = req.body;

            const success = await shopService.updateShopService(id, name, logo_url, description, status);
            if (!success) return res.status(404).json({ message: 'Shop not found' });

            res.json({ message: 'Shop updated successfully' });
        } catch (error: any) {
            console.error('Error updating shop:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async deleteShopController(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const success = await shopService.deleteShopService(id);

            if (!success) return res.status(404).json({ message: 'Shop not found' });
            res.json({ message: 'Shop deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting shop:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default new ShopController();
