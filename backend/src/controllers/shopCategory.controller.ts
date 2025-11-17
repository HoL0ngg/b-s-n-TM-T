// backend/src/controllers/shopCategory.controller.ts
import { Request, Response } from "express";
import * as shopCategoryService from "../services/shopCategory.service";

// Middleware checkShopOwner đã chạy trước
const getShopIdFromRequest = (req: Request): number => {
    return (req as any).shop.id;
}

export const getAllShopCategories = async (req: Request, res: Response) => {
    try {
        const shopId = getShopIdFromRequest(req);
        const categories = await shopCategoryService.getCategoriesByShopId(shopId);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh mục shop", error });
    }
};

export const createShopCategory = async (req: Request, res: Response) => {
    try {
        const shopId = getShopIdFromRequest(req);
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
        }

        const newCategoryId = await shopCategoryService.createCategory(name, shopId);
        res.status(201).json({ id: newCategoryId, name, shop_id: shopId });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo danh mục shop", error });
    }
};

export const updateShopCategory = async (req: Request, res: Response) => {
    try {
        const shopId = getShopIdFromRequest(req);
        const categoryId = parseInt(req.params.id, 10);
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
        }

        // Kiểm tra xem danh mục này có thuộc shop của user không
        const existingCategory = await shopCategoryService.getCategoryByIdAndShopId(categoryId, shopId);
        if (!existingCategory) {
            return res.status(404).json({ message: "Không tìm thấy danh mục hoặc bạn không có quyền sửa" });
        }

        await shopCategoryService.updateCategory(categoryId, name);
        res.status(200).json({ id: categoryId, name, shop_id: shopId });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật danh mục shop", error });
    }
};

export const deleteShopCategory = async (req: Request, res: Response) => {
    try {
        const shopId = getShopIdFromRequest(req);
        const categoryId = parseInt(req.params.id, 10);

        // Kiểm tra xem danh mục này có thuộc shop của user không
        const existingCategory = await shopCategoryService.getCategoryByIdAndShopId(categoryId, shopId);
        if (!existingCategory) {
            return res.status(404).json({ message: "Không tìm thấy danh mục hoặc bạn không có quyền xóa" });
        }

        // Cần kiểm tra xem có sản phẩm nào đang dùng category này không?
        // (Tạm thời cho phép xóa, bạn có thể nâng cấp sau)
        // Ví dụ: UPDATE products SET shop_cate_id = NULL WHERE shop_cate_id = ?

        await shopCategoryService.deleteCategory(categoryId);
        res.status(200).json({ message: "Xóa danh mục thành công" });
    } catch (error) {
        // Nếu lỗi do ràng buộc khóa ngoại (sản phẩm đang dùng)
        if ((error as any).code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ message: "Không thể xóa danh mục. Vẫn còn sản phẩm đang sử dụng danh mục này." });
        }
        res.status(500).json({ message: "Lỗi khi xóa danh mục shop", error });
    }
};