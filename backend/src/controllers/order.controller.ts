import { Request, Response } from 'express';
import * as OrderService from '../services/order.service';

export const getShopOrdersController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { status } = req.query;

        const orders = await OrderService.getOrdersForShop(userId, status as string | undefined);
        res.status(200).json(orders);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Lỗi khi lấy đơn hàng của Shop.' });
    }
};

export const updateShopOrderStatusController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const orderId = parseInt(req.params.orderId);
        const { status } = req.body;

        console.log("Controller Fix Check:", { userId, orderId, status });

        if (!status) {
            return res.status(400).json({ message: 'Trạng thái (status) là bắt buộc.' });
        }
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'OrderId phải là một con số.' });
        }

        await OrderService.updateOrderStateByShop(userId, orderId, status);

        res.status(200).json({ message: `Shop đã cập nhật trạng thái đơn hàng #${orderId} thành công.` });
        
    } catch (error: any) {
        console.error("Update Error:", error);
        res.status(400).json({ message: error.message || 'Lỗi khi cập nhật trạng thái.' });
    }
};

export const getShopOrderDetailController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const orderId = parseInt(req.params.orderId);

        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'OrderId phải là một con số.' });
        }

        const orderDetails = await OrderService.getOrderDetailForShop(userId, orderId);
        res.status(200).json(orderDetails);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Lỗi khi lấy chi tiết đơn hàng.' });
    }
};

export const getShopReturnsController = async (req: Request, res: Response) => {
    // Tạm thời trả về mảng rỗng
    res.status(200).json([]);
};