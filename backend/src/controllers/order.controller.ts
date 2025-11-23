import { Request, Response } from 'express';
import orderService from '../services/order.service';

class OrderController {
    getShopOrdersController = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { status } = req.query;
            console.log("userId", userId)

            const orders = await orderService.getOrdersForShop(userId, status as string | undefined);
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Lỗi khi lấy đơn hàng của Shop.' });
        }
    };

    updateShopOrderStatusController = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const orderId = parseInt(req.params.orderId);
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ message: 'Trạng thái (status) là bắt buộc.' });
            }
            if (isNaN(orderId)) {
                return res.status(400).json({ message: 'OrderId phải là một con số.' });
            }

            await orderService.updateOrderStateByShop(userId, orderId, status);

            res.status(200).json({ message: `Shop đã cập nhật trạng thái đơn hàng #${orderId} thành công.` });

        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Lỗi khi cập nhật trạng thái.' });
        }
    };

    getShopOrderDetailController = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const orderId = parseInt(req.params.orderId);

            if (isNaN(orderId)) {
                return res.status(400).json({ message: 'OrderId phải là một con số.' });
            }

            const orderDetails = await orderService.getOrderDetailForShop(userId, orderId);
            res.status(200).json(orderDetails);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Lỗi khi lấy chi tiết đơn hàng.' });
        }
    };

    /**
     * [Shop] Lấy danh sách đơn hàng trả (Placeholder)
     * Xử lý yêu cầu GET /api/shop/orders/returns
     */
    getShopReturnsController = async (req: Request, res: Response) => {
        // Tạm thời trả về mảng rỗng
        res.status(200).json([]);
    };

    getAllOrder = async (req: Request, res: Response) => {
        try {

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query.status as string;
            const search = req.query.search as string;

            const orders = await orderService.getAllOrders(page, limit, status, search);
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Lỗi khi lấy tất cả đơn hàng.' });
            console.log(error);

        }
    }

    getDetailOrder = async (req: Request, res: Response) => {
        try {
            const orderId = Number(req.params.id);
            const result = await orderService.getOrderDetails(orderId);
            res.json(result);
        } catch (error: any) {
            console.error(error);
            res.status(404).json({ message: error.message || "Lỗi lấy chi tiết đơn hàng" });
        }
    }

    getUserOrder = async (req: Request, res: Response) => {
        try {

            const userId = (req as any).user.id;
            const status = req.query.status as string | undefined;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await orderService.getUserOrder(userId, page, limit, status);

            res.json(result);
        } catch (error: any) {
            console.error(error);
            res.status(404).json({ message: error.message || "Lỗi lấy đơn hàng của người dùng" });
        }
    }

    cancelOrder = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const orderId = Number(req.params.id);
            await orderService.cancelOrderByUser(userId, orderId);
            res.status(200).json({ message: "Hủy đơn hàng thành công" });
        } catch (error: any) {
            res.status(400).json({ message: error.message || "Lỗi khi hủy đơn hàng" });
        }
    }

    confirmReceived = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const orderId = Number(req.params.id);
            await orderService.confirmOrderReceived(userId, orderId);
            res.status(200).json({ message: "Xác nhận nhận hàng thành công" });
        } catch (error: any) {
            res.status(400).json({ message: error.message || "Lỗi khi xác nhận nhận hàng" });
        }
    }

    updatePaymentStatus = async (req: Request, res: Response) => {
        try {
            const orderId = Number(req.params.id);
            const { paymentStatus } = req.body;
            if (!paymentStatus) {
                return res.status(400).json({ message: "Thiếu trạng thái thanh toán" });
            }
            await orderService.updateOrderPaymentStatus(orderId, paymentStatus);
            res.status(200).json({ message: "Cập nhật trạng thái thanh toán thành công" });
        } catch (error: any) {
            res.status(400).json({ message: error.message || "Lỗi khi cập nhật trạng thái thanh toán" });
        }
    }
}

export default new OrderController();
