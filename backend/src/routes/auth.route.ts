import { Router } from "express";
import { loginController, registerController, profileController, changePasswordController, getUserByPhoneNumber } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/change-password", changePasswordController);
router.get("/profile", verifyToken, profileController);
router.get("/user/:id", getUserByPhoneNumber);


export default router;