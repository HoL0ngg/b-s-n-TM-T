import { Router } from "express";
import { checkAdmin, verifyToken } from "../middleware/auth.middleware";
import adminController from "../controllers/admin.controller";

const AdminRouter = Router();

AdminRouter.post("/login", adminController.loginAdmin);

export default AdminRouter;