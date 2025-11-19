import { Router } from "express";
import adminController from "../controllers/admin.controller";

const AdminRouter = Router();

AdminRouter.post("/login", adminController.loginAdmin);
AdminRouter.get("/stats", adminController.getStats);

export default AdminRouter;