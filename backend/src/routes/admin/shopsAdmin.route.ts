import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import shopsAdminController from "../../controllers/admin/shopsAdmin.controller";

const ShopsAdminRoute = Router();

ShopsAdminRoute.get("/shops", verifyToken, shopsAdminController.getShopsByStatusController);
ShopsAdminRoute.get("/shops/:id", verifyToken, shopsAdminController.getShopDetailController);

ShopsAdminRoute.patch("/:id", verifyToken, shopsAdminController.updateShopStatusController);

export default ShopsAdminRoute;