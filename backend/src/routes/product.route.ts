// Đường dẫn: backend/src/routes/product.route.ts
// (PHIÊN BẢN FINAL - ĐÃ KIỂM TRA KỸ)

import { Router } from "express";
import productController from "../controllers/product.controller";
import { verifyToken, checkOptionalAuth } from "../middleware/auth.middleware";
import { checkShopOwner } from "../middleware/checkShopOwner";
// QUAN TRỌNG: Import đúng uploadProductImage
import { uploadPromoBanner, uploadProductImage } from "../config/multer";

const ProductRouter = Router();

// ===========================================
// 1. TUYẾN ĐƯỜNG BẢO MẬT
// ===========================================

// TẠO SẢN PHẨM (POST)
ProductRouter.post(
    "/", 
    verifyToken, 
    checkShopOwner, 
    uploadProductImage, // Middleware xử lý FormData (File + Text)
    productController.createProductController
);

// SỬA SẢN PHẨM (PUT) - ĐÃ SỬA
ProductRouter.put(
    "/:id", 
    verifyToken, 
    checkShopOwner, 
    uploadProductImage, // <-- QUAN TRỌNG: Phải có ở đây để đọc FormData khi sửa
    productController.updateProductController
);

// XÓA SẢN PHẨM (DELETE)
ProductRouter.delete("/:id", verifyToken, checkShopOwner, productController.deleteProductController);

// BẬT/TẮT TRẠNG THÁI (PATCH)
// (Lưu ý: Route này dùng JSON, không dùng FormData, nên không cần uploadProductImage)
ProductRouter.patch(
    "/:id/status",
    verifyToken,
    checkShopOwner,
    productController.updateProductStatusController
);

// LẤY DỮ LIỆU ĐỂ SỬA (GET)
ProductRouter.get("/edit-details/:id", verifyToken, checkShopOwner, productController.getCompleteProductForEditController);

// ===========================================
// 2. TUYẾN ĐƯỜNG CÔNG KHAI
// ===========================================
ProductRouter.get("/product/search", productController.getProductsByKeyWordController);
ProductRouter.get("/recommend/for-you", checkOptionalAuth, productController.getRecommendedProduct);
ProductRouter.get("/recommend/new", productController.getNewProducts);
ProductRouter.get("/recommend/hot", productController.getHotProducts);
ProductRouter.get("/attributes/all", productController.getAllAttributesController);
ProductRouter.get("/category/:id", productController.getProductsController);
ProductRouter.get("/search", productController.getProductsSearchController);
ProductRouter.get("/related-categories", productController.getRelatedCategoriesController);
ProductRouter.get("/shop/:id", productController.getProductOnShopIdController);
ProductRouter.get("/:id/images", productController.getProductImgOnIdController);
ProductRouter.get("/:id/reviews", productController.getReviewByProductIdController);
ProductRouter.get("/:id/review-summary", productController.getReviewSummaryByProductIdController);
ProductRouter.get("/:id/details", productController.getProductDetailsByProductIdController);
ProductRouter.get("/:id/attributes", productController.getAttributeOfProductVariantsController);

// --- Routes Khuyến mãi ---
ProductRouter.get('/promotions', verifyToken, productController.getShopPromotions);
ProductRouter.get('/promotions/:id/items', verifyToken, productController.getPromotionDetails);
ProductRouter.patch('/promotions/:id/items/:variantid', verifyToken, productController.updatePromotionItem);
ProductRouter.patch('/promotions/:id/items', verifyToken, productController.savePromotionItems);
ProductRouter.delete('/promotions/:promoId/items/:variantId', productController.deletePromotionItem);
ProductRouter.post('/promotions/add', verifyToken, uploadPromoBanner, productController.CreatePromotion); 

// --- Route gốc (GET by ID) ---
ProductRouter.get("/:id", checkOptionalAuth, productController.getProductOnIdController);

export default ProductRouter;