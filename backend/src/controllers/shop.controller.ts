import { Request, Response } from "express";
import { getShopCateOnIdService, getShopOnIdService } from "../services/shop.service";

export const getShopOnIdController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const type = req.query.type || "";
    // console.log(id);
    if (type != "") {
        const tmp = await getShopCateOnIdService(Number(id), type.toString());
        return res.status(200).json(tmp);
    }
    const data = await getShopOnIdService(Number(id));
    res.status(200).json(data);
}