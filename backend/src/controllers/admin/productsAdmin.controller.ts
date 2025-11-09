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
}
export default new ProductsAdminController();