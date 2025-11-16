// controller file

import { Request, Response } from "express"
import productService from "../../services/product.service";

class ProductsAdminController {
    getProductsByStatusController = async (req: Request, res: Response) => {
        // CHANGED: Lấy thêm các query params
        const status = req.query.status as string;
        const search = req.query.search as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10; // Đặt limit mặc định (hoặc lấy từ client)

        try {
            let whereClause = "WHERE 1=1";
            const params: any[] = [];

            // Lọc theo status (nếu có và không phải 'all')
            if (status && status !== 'all') {
                whereClause += " AND status = ?";
                params.push(Number(status));
            }

            // CHANGED: Thêm logic tìm kiếm
            if (search) {
                whereClause += " AND (name LIKE ? OR category_name LIKE ?)"; // Giả sử tìm theo name và category
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm);
            }

            // CHANGED: Truyền page và limit vào service
            const response = await productService.getProductsService(whereClause, params, page, limit);

            // CHANGED: Trả về cả object response (products và totalPages)
            res.status(200).json(response);

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    updateProductStatusController = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const productId = parseInt(id, 10);
            const { status, reason } = req.body;
            console.log(reason);

            if (isNaN(productId)) {
                return res.status(400).json({ message: "Product ID không hợp lệ." });
            }
            if (![1, -1].includes(status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ. Chỉ chấp nhận 1 hoặc -1." });
            }
            if (status === -1 && (!reason || reason.trim() === '')) {
                return res.status(400).json({ message: "Cần phải có lý do (reason) khi từ chối." });
            }

            const success = await productService.updateProductStatusService(productId, status, reason);

            if (!success) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
            }

            res.status(200).json({
                message: `Sản phẩm (ID: ${productId}) đã được cập nhật trạng thái thành công.`
            });

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
        }
    };



}
export default new ProductsAdminController();