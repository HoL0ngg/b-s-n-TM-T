import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";
import { uploadAvatar } from "../config/multer";

const UserRouter = Router();

UserRouter.get("/:id", userController.getUserByIdController);
UserRouter.get("/:id/address", userController.getAddressByuserIdController);
UserRouter.get("/:id/address/default", userController.getDefaultAddressByuserIdController);
UserRouter.post("/:id/address", userController.postAddressUserController)
UserRouter.put("/:id/address/change-default", verifyToken, userController.postChangeAddressDefault)
UserRouter.get("/:id/profile", userController.getUserProfileController);
UserRouter.patch("/profile", verifyToken, uploadAvatar, userController.updateProfileController);
UserRouter.post("/orders/:orderId/review", verifyToken, userController.submitReviewController);
UserRouter.get("/orders/:orderId/check-reviewed", userController.checkOrderReviewedController);
// UserRouter.patch('/avatar', verifyToken, uploadAvatar.single('avatar'), userController.updateAvatar);

export default UserRouter;