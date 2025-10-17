import { Request, Response } from "express"
import { getProductOnCategoryIdService, getProductOnIdService, getProductImgOnIdService, get5ProductOnShopIdService, getProductOnShopIdService } from "../services/product.service"

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

export const getProductOnShopIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const type = req.query.type;
        const sort = req.query.sortBy || "popular";
        // console.log(sort);

        let data;
        switch (type) {
            case 'all':
                data = await getProductOnShopIdService(Number(id), String(sort));
                break;
            case 'suggest':
                data = await get5ProductOnShopIdService(Number(id));
                break;
            default:
                break;
        }
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
    }
}