import { Router } from "express";
import { getUserByIdController } from "../controllers/user.controller";

const UserRouter = Router();

UserRouter.get("/:id", getUserByIdController);

export default UserRouter;