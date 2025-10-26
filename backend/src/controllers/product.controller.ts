import { Request, Response } from "express"
import productService from "../services/product.service";

class productController {
    getProductOnCategoryIdController = async (req: Request, res: Response) => {
        try {
            const category_id = req.query.category_id;
            const product = await productService.getProductOnCategoryIdService(Number(category_id));
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
        }
    }

    getProductOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const product = await productService.getProductOnIdService(Number(id));
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
        }
    }

    getProductImgOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            // const product = await productService.getProductOnIdService(Number(id));
            const images = await productService.getProductImgOnIdService(Number(id));
            res.status(200).json(images);
        } catch (err) {
            console.log(err);
        }
    }

    getProductOnShopIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const type = req.query.type;
            const sort = req.query.sortBy || "popular";
            const cate = req.query.bst || 0;

            let data;
            switch (type) {
                case 'all':
                    data = await productService.getProductOnShopIdService(Number(id), String(sort), Number(cate));
                    break;
                case 'suggest':
                    data = await productService.get5ProductOnShopIdService(Number(id));
                    break;
                default:
                    break;
            }
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
        }
    }

    getReviewByProductIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const type = req.query.type;
            const product = await productService.getReviewByProductIdService(Number(id), Number(type) || 0);
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
        }
    }

    getReviewSummaryByProductIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const reviews = await productService.getReviewSummaryByProductIdService(Number(id));
            res.status(200).json(reviews);
        } catch (err) {
            console.log(err);
        }
    }

    getProductDetailsByProductIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const productDetail = await productService.getProductDetailsByProductId(Number(id));
            res.status(200).json(productDetail);
        } catch (error) {
            console.log(error);
        }
    }
}

export default new productController();