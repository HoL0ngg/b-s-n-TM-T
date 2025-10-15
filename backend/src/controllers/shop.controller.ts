import { Request, Response } from "express";
import { getShopOnIdService } from "../services/shop.service";

export const getShopOnIdController = async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(id);

    const data = await getShopOnIdService(Number(id));
    res.status(200).json(data);
}