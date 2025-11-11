import { Router } from "express";
import productsAdminController from "../../controllers/admin/productsAdmin.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const ProductsAdminRoute = Router();

ProductsAdminRoute.get("/", verifyToken, productsAdminController.getProductsByStatusController);

ProductsAdminRoute.patch("/:id", verifyToken, productsAdminController.updateProductStatusController);


export default ProductsAdminRoute;