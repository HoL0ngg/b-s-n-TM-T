import { Router } from "express";
import cartController from "../controllers/cart.controller";

const CartRouter = Router();

CartRouter.post("/add", cartController.addToCartController)
CartRouter.get("/getCart/:id", cartController.getCartByIdController);

export default CartRouter;