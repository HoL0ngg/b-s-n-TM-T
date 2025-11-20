import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { verifyToken } from "../middleware/auth.middleware";

const CartRouter = Router();

CartRouter.post("/add", verifyToken, cartController.addToCartController)
CartRouter.get("/getCart", verifyToken, cartController.getCartByIdController);
CartRouter.patch("/updateCart/:product_id", verifyToken, cartController.updateProductQuantity);
CartRouter.delete("/delete/:id", verifyToken, cartController.deleteProduct);
CartRouter.delete("/delete-shop/:id", verifyToken, cartController.deleteShop);

export default CartRouter;