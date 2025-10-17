import { Router } from "express";
import { getProductOnCategoryIdController, getProductOnIdController, getProductImgOnIdController, getProductOnShopIdController } from "../controllers/prouduct.controller";

const ProductRouter = Router();

ProductRouter.get("/", getProductOnCategoryIdController);
ProductRouter.get("/:id", getProductOnIdController);
ProductRouter.get("/images/:id", getProductImgOnIdController);
ProductRouter.get("/shops/:id", getProductOnShopIdController);

export default ProductRouter;
