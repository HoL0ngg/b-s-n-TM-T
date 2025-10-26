import { Request, Response } from "express";
import cartService from "../services/cart.service";

class CartController {
    addToCartController = async (req: Request, res: Response) => {
        try {
            const { product_id, user_id, quantity } = req.body;

            await cartService.addToCartService(user_id, product_id, quantity);
            res.status(200).json({ message: 'Ngon', result: true });
        } catch (Err) {
            console.log(Err);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    getCartByIdController = async (req: Request, res: Response) => {
        try {
            const user_id = req.params.id;
            const data = await cartService.getCartByIdService(user_id);
            res.status(200).json(data);
            return data;
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

}

export default new CartController();