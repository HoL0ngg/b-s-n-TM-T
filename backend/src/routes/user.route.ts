import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";

const UserRouter = Router();

UserRouter.get("/:id", userController.getUserByIdController);
UserRouter.get("/:id/address", userController.getAddressByuserIdController);
UserRouter.get("/:id/address/default", userController.getDefaultAddressByuserIdController);
UserRouter.post("/:id/address", userController.postAddressUserController)
UserRouter.put("/:id/address/change-default", verifyToken, userController.postChangeAddressDefault)
UserRouter.get("/:id/profile", userController.getUserProfileController);
UserRouter.put("/:id/profile", verifyToken, userController.updateProfileController);

export default UserRouter;