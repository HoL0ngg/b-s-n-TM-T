import { Request, Response } from "express"
import productService from "../services/product.service";

class productController {
    getProductOnCategoryIdController = async (req: Request, res: Response) => {
        try {
            const category_id = Number(req.query.category_id);
            if (!category_id) {
                console.log("hahah");
                return res.status(400).json({ message: "Missing or invalid category_id" });
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 12;
            const product = await productService.getProductOnCategoryIdService(category_id, page, limit);
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
        }
    }

    getProductOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const user_id = (req as any).user?.id;
            const product = await productService.getProductOnIdService(Number(id));

            if (product && user_id) {
                productService.logView(user_id, Number(product.id))
                    .catch((err: any) => console.error("Lỗi ghi log xem sản phẩm:", err));
            }
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
    getAttributeOfProductVariantsController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const attributes = await productService.getAttributeOfProductVariantsByProductIdService(Number(id));
            res.status(200).json(attributes);
        } catch (error) {
            console.log(error);

        }
    }
    getProductsInPriceOrderController = async (req: Request, res: Response) => {
        try {
            const category_id = Number(req.query.category_id);
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 12;
            const typeOfSort = String(req.query.sort);
            const products = await productService.getProductsInPriceOrderService(category_id, page, limit, typeOfSort);
            return res.status(200).json(products);
        } catch (error) {
            console.log(error);

        }
    }
}

export default new productController();