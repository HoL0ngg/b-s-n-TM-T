import { Request, Response } from "express";
import cartService from "../services/cart.service";

class CartController {
    addToCartController = async (req: Request, res: Response) => {
        try {
            const { product_id, quantity } = req.body;
            const user_id = (req as any).user.id;

            await cartService.addToCartService(user_id, product_id, quantity);
            res.status(200).json({ message: 'Ngon', result: true });
        } catch (Err) {
            console.log(Err);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    getCartByIdController = async (req: Request, res: Response) => {
        try {
            console.log((req as any).user.id);
            const user_id = (req as any).user.id;
            const data = await cartService.getCartByIdService(user_id);

            res.status(200).json(data);
            return data;
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    updateProductQuantity = async (req: Request, res: Response) => {
        try {
            const user_id = (req as any).user.id;
            const product_id = req.params.product_id;
            const quantity = req.body.quantity;
            console.log(quantity);
            const data = await cartService.updateProductQuantity(user_id, product_id, quantity);
            console.log(data);
            res.status(200).json({ success: data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    deleteProduct = async (req: Request, res: Response) => {
        try {
            const product_id = req.params.id;
            const user_id = (req as any).user.id;
            const data = await cartService.deleteProduct(user_id, product_id);
            res.status(200).json({ success: data });

        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    }

    deleteShop = async (req: Request, res: Response) => {
        try {
            const shop_id = req.params.id;
            const user_id = (req as any).user.id;
            const data = await cartService.deleteShop(user_id, Number(shop_id));
            res.status(200).json({ success: data });

        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    }

}

export default new CartController();