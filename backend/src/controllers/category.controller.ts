import { Request, Response } from "express"
import { getAllCategories } from "../services/category.service"

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy danh mục" });
    }
}