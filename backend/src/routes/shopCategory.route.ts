// backend/src/routes/shopCategory.route.ts
import { Router } from "express";
import * as shopCategoryController from "../controllers/shopCategory.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { checkShopOwner } from "../middleware/checkShopOwner";

const router = Router();

// Tất cả các route trong file này đều yêu cầu:
// 1. Đã đăng nhập (verifyToken)
// 2. Phải là chủ shop (checkShopOwner)
router.use(verifyToken, checkShopOwner);

router.get("/", shopCategoryController.getAllShopCategories);
router.post("/", shopCategoryController.createShopCategory);
router.put("/:id", shopCategoryController.updateShopCategory);
router.delete("/:id", shopCategoryController.deleteShopCategory);

export default router;