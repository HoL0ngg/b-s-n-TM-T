import { Request, Response } from "express";
import cartService from "../services/cart.service";
import axios from "axios";

const VIETQR_API_URL = "https://api.vietqr.io/v2/generate";
const VIETQR_CLIENT_ID = process.env.VIETQR_CLIENT_ID;
const VIETQR_API_KEY = process.env.VIETQR_API_KEY;

// Thông tin tài khoản nhận tiền của BẠN
const MY_BANK_ID = "970422"; // MBBank
const MY_ACCOUNT_NO = "0937211264";
const MY_ACCOUNT_NAME = "Ho Hoang Long";

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
    createVietQR = async (req: Request, res: Response) => {
        // (Giả sử bạn đã tạo đơn hàng và có 'orderId' và 'totalAmount')
        const orderId = "DH" + Date.now(); // Ví dụ: DH167888999
        const totalAmount = (req as any).total; // Số tiền

        // 1. Tạo đơn hàng trong CSDL (status: 'pending')
        // await orderRepository.create(orderId, totalAmount, ...);

        // 2. Chuẩn bị payload để gọi VietQR
        const payload = {
            "accountNo": MY_ACCOUNT_NO,
            "accountName": MY_ACCOUNT_NAME,
            "acqId": MY_BANK_ID,
            "amount": totalAmount,
            "addInfo": orderId, // <-- Mấu chốt: Đây là nội dung chuyển khoản
            "format": "text", // Yêu cầu trả về Data URL (base64)
            "template": "compact"
        };

        try {
            // 3. Gọi API của VietQR
            const response = await axios.post(VIETQR_API_URL, payload, {
                headers: {
                    'x-client-id': VIETQR_CLIENT_ID,
                    'x-api-key': VIETQR_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);


            // 4. Lấy mã QR (dạng base64 data URL)
            const qrDataURL = "";

            // 5. Trả về cho Frontend
            res.json({
                orderId: orderId,
                qrDataURL: qrDataURL
            });

        } catch (error: any) {
            console.error("Lỗi tạo mã VietQR:", error);
            res.status(500).json({ message: "Không thể tạo mã QR" });
        }
    }
}

export default new CartController();