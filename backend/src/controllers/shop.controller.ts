import { Request, Response } from "express";
import shopService from "../services/shop.service";

class shopController {
    getShopOnIdController = async (req: Request, res: Response) => {
        const id = req.params.id;
        const type = req.query.type || "";
        // console.log(id);
        if (type != "") {
            const tmp = await shopService.getShopCateOnIdService(Number(id), type.toString());
            return res.status(200).json(tmp);
        }
        const data = await shopService.getShopOnIdService(Number(id));
        res.status(200).json(data);
    }

    getHotShops = async (req: Request, res: Response) => {
        try {
            const data = await shopService.getHotShops();
            res.status(200).json(data);
        } catch (err) {
            res.status(501).json({ success: false });
        }
    }
}

export default new shopController();
