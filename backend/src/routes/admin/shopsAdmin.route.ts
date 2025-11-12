import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import shopsAdminController from "../../controllers/admin/shopsAdmin.controller";

const ShopsAdminRoute = Router();

ShopsAdminRoute.get("/shops", verifyToken, shopsAdminController.getShopsByStatusController);

export default ShopsAdminRoute;