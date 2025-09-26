import { Router } from "express";
import { loginController, registerController, profileController } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.get("/profile", verifyToken, profileController);

export default router;