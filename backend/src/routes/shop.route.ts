import { Router } from "express";
import shopController from "../controllers/shop.controller";
const ShopRouter = Router();

ShopRouter.get("/shop/:id", shopController.getShopOnIdController);
ShopRouter.get("/hot", shopController.getHotShops);

export default ShopRouter;