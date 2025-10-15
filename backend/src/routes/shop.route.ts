import { Router } from "express";
import { getShopOnIdController } from "../controllers/shop.controller";
const ShopRouter = Router();

ShopRouter.get("/:id", getShopOnIdController);

export default ShopRouter;