import { Router } from "express";
import productController from "../controllers/product.controller";

// GIỮ TẤT CẢ IMPORT TỪ CẢ HAI NHÁNH
import { verifyToken, checkOptionalAuth } from "../middleware/auth.middleware";
import { checkShopOwner } from "../middleware/checkShopOwner";

const ProductRouter = Router();

// ===========================================
// 1. TUYẾN ĐƯỜNG BẢO MẬT (TỪ NHÁNH CỦA BẠN - qhuykuteo)
// ===========================================
ProductRouter.post("/", verifyToken, checkShopOwner, productController.createProductController);
ProductRouter.put("/:id", verifyToken, checkShopOwner, productController.updateProductController);
ProductRouter.delete("/:id", verifyToken, checkShopOwner, productController.deleteProductController);

// (Cải tiến "Bật/Tắt" của bạn)
ProductRouter.patch(
    "/:id/status",
    verifyToken,
    checkShopOwner,
    productController.updateProductStatusController
);

// (API "Sửa sản phẩm" của bạn)
ProductRouter.get("/edit-details/:id", verifyToken, checkShopOwner, productController.getCompleteProductForEditController);


// ===========================================
// 2. TUYẾN ĐƯỜNG CÔNG KHAI (TRỘN TỪ CẢ HAI)
// ===========================================

// --- Các route chung & của bạn (qhuykuteo) ---
ProductRouter.get("/product/search", productController.getProductsByKeyWordController);
ProductRouter.get("/recommend/for-you", checkOptionalAuth, productController.getRecommendedProduct);
ProductRouter.get("/recommend/new", productController.getNewProducts);
ProductRouter.get("/recommend/hot", productController.getHotProducts);
ProductRouter.get("/attributes/all", productController.getAllAttributesController);
ProductRouter.get("/category/:id", productController.getProductsController);
ProductRouter.get("/shop/:id", productController.getProductOnShopIdController);
ProductRouter.get("/:id/images", productController.getProductImgOnIdController);
ProductRouter.get("/:id/reviews", productController.getReviewByProductIdController);
ProductRouter.get("/:id/review-summary", productController.getReviewSummaryByProductIdController);
ProductRouter.get("/:id/details", productController.getProductDetailsByProductIdController);
ProductRouter.get("/:id/attributes", productController.getAttributeOfProductVariantsController);

// --- Các route MỚI của đồng đội (main) ---
ProductRouter.get('/promotions', verifyToken, productController.getShopPromotions);
ProductRouter.get('/promotions/:id/items', verifyToken, productController.getPromotionDetails);
ProductRouter.patch('/promotions/:id/items/:variantid', verifyToken, productController.updatePromotionItem);
ProductRouter.patch('/promotions/:id/items', verifyToken, productController.savePromotionItems);
ProductRouter.delete('/promotions/:promoId/items/:variantId', productController.deletePromotionItem);

// --- Route gốc (GET by ID) ---
// (Luôn để cuối cùng)
ProductRouter.get("/:id", checkOptionalAuth, productController.getProductOnIdController);

export default ProductRouter;