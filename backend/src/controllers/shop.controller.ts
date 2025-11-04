import { Request, Response } from "express";
import shopService from "../services/shop.service";

class shopController {
    getShopOnIdController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const type = req.query.type || "";
        if (type != "") {
            const tmp = await shopService.getShopCateOnIdService(Number(id), type.toString());
            return res.status(200).json(tmp);
        }
        const data = await shopService.getShopOnIdService(Number(id));
        res.status(200).json(data);
    }

    // ← THÊM FUNCTION NÀY
    getShopByOwnerController = async (req: Request, res: Response) => {
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
}

export default new shopController();