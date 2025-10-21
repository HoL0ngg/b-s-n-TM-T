import { Router } from "express";
import { getUserByIdController, getAddressByuserIdController, getUserProfileController, updateProfileController } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const UserRouter = Router();

UserRouter.get("/:id", getUserByIdController);
UserRouter.get("/:id/address", getAddressByuserIdController);
UserRouter.get("/:id/profile", getUserProfileController);
UserRouter.put("/:id/profile", verifyToken, updateProfileController);

export default UserRouter;