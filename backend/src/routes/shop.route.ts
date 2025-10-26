import { Router } from "express";
import shopController from "../controllers/shop.controller";
const ShopRouter = Router();

ShopRouter.get("/:id", shopController.getShopOnIdController);

export default ShopRouter;