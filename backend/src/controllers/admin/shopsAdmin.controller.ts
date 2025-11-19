import { Request, Response } from "express"
import shopService from "../../services/shop.service";
import userService from "../../services/user.service";
import productService from "../../services/product.service";
import { parse } from "path";
class shopsAdminController {
    getShopsByStatusController = async (req: Request, res: Response) => {
        try {
            // console.log("hihii");

            const status = req.query.status as string;
            const search = req.query.search as string;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            // console.log(status);

            const response = await shopService.getShopsByStatusService(status, page, limit, search);
            res.status(200).json(response);

        } catch (error) {
            console.error("Lỗi trong getShopsByStatusController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    updateShopStatusController = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const shopId = parseInt(id, 10);
            const { status } = req.body;
            if (isNaN(shopId)) {
                return res.status(400).json({ message: "Shop ID không hợp lệ." });
            }
            if (![1, -1].includes(status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ. Chỉ chấp nhận 1 hoặc -1." });
            }
            const success = await shopService.updateShopStatusService(shopId, status);
            if (!success) {
                return res.status(404).json({ message: "Shop không tồn tại." });
            }
            res.status(200).json({ message: "Cập nhật trạng thái shop thành công." });
        } catch (error) {
            console.error("Lỗi trong updateShopStatusController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
    getShopDetailController = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id, 10);
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            if (isNaN(id)) {
                return res.status(400).json({ message: "Shop ID không hợp lệ." });
            }
            const shopPromise = shopService.getShopOnIdService(id);
            const userPromise = userService.getShopOwnerInformation(id);
            const productResponsePromise = productService.getProductsOnShopId(id, page, limit);
            const [shopResult, userResult, productPromiseResult] = await Promise.all([
                shopPromise,
                userPromise,
                productResponsePromise,
            ])

            res.status(200).json({
                shop: shopResult,
                userInfo: userResult,
                products: productPromiseResult.products,
                totalPages: productPromiseResult.totalPages
            })
        } catch (error) {
            console.error("Lỗi trong getShopDetailController:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
export default new shopsAdminController();