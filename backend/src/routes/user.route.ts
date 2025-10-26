import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";

const UserRouter = Router();

UserRouter.get("/:id", userController.getUserByIdController);
UserRouter.get("/:id/address", userController.getAddressByuserIdController);
UserRouter.post("/:id/address", userController.postAddressUserController)
UserRouter.get("/:id/profile", userController.getUserProfileController);
UserRouter.put("/:id/profile", verifyToken, userController.updateProfileController);

export default UserRouter;