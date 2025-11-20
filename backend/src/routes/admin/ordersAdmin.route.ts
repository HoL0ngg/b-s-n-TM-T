import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import ordersAdminController from "../../controllers/admin/ordersAdmin.controller";


const OrdersAdminRoute = Router();

OrdersAdminRoute.get("/ordersAdmin", verifyToken, ordersAdminController.getAllOrdersController);

export default OrdersAdminRoute;