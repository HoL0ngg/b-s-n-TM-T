import { Router } from "express";
import { getProductOnCategoryIdController, getProductOnIdController, getProductImgOnIdController, getProductOnShopIdController, getReviewByProductIdController, getReviewSummaryByProductIdController } from "../controllers/prouduct.controller";

const ProductRouter = Router();

ProductRouter.get("/", getProductOnCategoryIdController);
ProductRouter.get("/:id", getProductOnIdController);
ProductRouter.get("/images/:id", getProductImgOnIdController);
ProductRouter.get("/shops/:id", getProductOnShopIdController);
ProductRouter.get("/reviews/:id", getReviewByProductIdController);
ProductRouter.get("/reviews/:id/summary", getReviewSummaryByProductIdController);

export default ProductRouter;
