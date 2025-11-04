import { Router } from "express";
import shopController from "../controllers/shop.controller";
const ShopRouter = Router();

ShopRouter.get("/by-owner/:ownerId", shopController.getShopByOwnerController); // Đặt trước
ShopRouter.get("/:id", shopController.getShopOnIdController); // Đặt sau

export default ShopRouter;