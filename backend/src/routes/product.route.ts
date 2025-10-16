import { Router } from "express";
import { getProductOnCategoryIdController, getProductOnIdController, getProductImgOnIdController, get5ProductOnShopIdController } from "../controllers/prouduct.controller";

const ProductRouter = Router();

ProductRouter.get("/", getProductOnCategoryIdController);
ProductRouter.get("/:id", getProductOnIdController);
ProductRouter.get("/images/:id", getProductImgOnIdController);
ProductRouter.get("/shops/:id", get5ProductOnShopIdController);

export default ProductRouter;
