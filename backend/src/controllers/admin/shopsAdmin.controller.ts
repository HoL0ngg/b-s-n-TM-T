import { Request, Response } from "express"
import shopService from "../../services/shop.service";
class shopsAdminController {
    getShopsByStatusController = async (req: Request, res: Response) => {
        try {
            console.log("hihii");

            const status = req.query.status as string;
            const search = req.query.search as string;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            console.log(status);

            const response = await shopService.getShopsByStatusService(status, page, limit, search);
            res.status(200).json(response);

        } catch (error) {
            console.error("Lỗi trong getShopsByStatusController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

}
export default new shopsAdminController();