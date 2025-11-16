import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import usersAdminController from "../../controllers/admin/usersAdmin.controller";

const UsersAdminRoute = Router();

UsersAdminRoute.get("/users/sellers", verifyToken, usersAdminController.getSellersController);
UsersAdminRoute.get("/users/buyers", verifyToken, usersAdminController.getBuyersController);

export default UsersAdminRoute;