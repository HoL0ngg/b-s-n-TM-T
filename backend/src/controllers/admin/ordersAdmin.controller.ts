import { Request, Response } from "express"

import orderService from "../../services/order.service";

class ordersAdminController {
    getAllOrdersController = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.query.shopId as string, 10);
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            // console.log("Received getAllOrders request with shopId:", id, "page:", page, "limit:", limit);
            if (isNaN(id)) {
                return res.status(400).json({ message: "Shop ID không hợp lệ." });
            }
            const ordersResponse = await orderService.getAllOrders(page, limit, undefined, undefined, id);
            // console.log("Orders response:", ordersResponse);
            res.status(200).json(ordersResponse);
        } catch (error) {
            console.error("Lỗi trong getAllOrders:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
export default new ordersAdminController();