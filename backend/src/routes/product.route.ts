import { Router } from "express";
import { getProductOnCategoryIdController, getProductOnIdController, getProductImgOnIdController } from "../controllers/prouduct.controller";

const ProductRouter = Router();

ProductRouter.get("/", getProductOnCategoryIdController);
ProductRouter.get("/:id", getProductOnIdController);
ProductRouter.get("/images/:id", getProductImgOnIdController);

export default ProductRouter;
