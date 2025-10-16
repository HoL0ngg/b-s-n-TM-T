import { Request, Response } from "express"
import { getProductOnCategoryIdService, getProductOnIdService, getProductImgOnIdService, get5ProductOnShopIdService } from "../services/product.service"

export const getProductOnCategoryIdController = async (req: Request, res: Response) => {
    try {
        const category_id = req.query.category_id;
        const product = await getProductOnCategoryIdService(Number(category_id));
        res.status(200).json(product);
    } catch (err) {
        console.log(err);
    }
}

export const getProductOnIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const product = await getProductOnIdService(Number(id));
        res.status(200).json(product);
    } catch (err) {
        console.log(err);
    }
}

export const getProductImgOnIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // const product = await getProductOnIdService(Number(id));
        const images = await getProductImgOnIdService(Number(id));
        res.status(200).json(images);
    } catch (err) {
        console.log(err);
    }
}

export const get5ProductOnShopIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = await get5ProductOnShopIdService(Number(id));
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
    }
}