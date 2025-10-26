import { Router } from "express";
import productController from "../controllers/product.controller";

const ProductRouter = Router();

ProductRouter.get("/", productController.getProductOnCategoryIdController);
ProductRouter.get("/:id", productController.getProductOnIdController);
ProductRouter.get("/images/:id", productController.getProductImgOnIdController);
ProductRouter.get("/shops/:id", productController.getProductOnShopIdController);
ProductRouter.get("/reviews/:id", productController.getReviewByProductIdController);
ProductRouter.get("/reviews/:id/summary", productController.getReviewSummaryByProductIdController);
ProductRouter.get("/productdetails/:id", productController.getProductDetailsByProductIdController);

export default ProductRouter;
