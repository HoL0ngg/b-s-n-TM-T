import { Router } from "express";
import shopController from "../controllers/shop.controller";
const ShopRouter = Router();

ShopRouter.get("/by-owner/:ownerId", shopController.getShopByOwnerController); // Đặt trước
ShopRouter.get("/:id", shopController.getShopOnIdController); // Đặt sau
ShopRouter.get("/shop/:id", shopController.getShopOnIdController);
ShopRouter.get("/hot", shopController.getHotShops);

export default ShopRouter;