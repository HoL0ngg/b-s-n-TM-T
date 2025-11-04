import { Request, Response } from "express"
import categoryService from "../services/category.service"
class categoryController {
    getCategoriesController = async (req: Request, res: Response) => {
        try {
            const categories = await categoryService.getAllCategoriesService();
            res.status(200).json(categories);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi khi lấy danh mục" });
        }
    }

    getSubCategoryController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const subCategories = await categoryService.getSubCategoryService(Number(id));
            res.status(200).json(subCategories);
        } catch (error) {
            console.log(error);

        }
    }

}
export default new categoryController();