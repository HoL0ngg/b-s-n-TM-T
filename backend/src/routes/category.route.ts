import { Router } from "express";
import categoryController from "../controllers/category.controller";

const CategoryRouter = Router();

CategoryRouter.get("/", categoryController.getCategoriesController);
CategoryRouter.get("/subCategories/:id", categoryController.getSubCategoryController);

export default CategoryRouter;
