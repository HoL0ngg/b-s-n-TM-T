import { Router } from "express";
import productController from "../controllers/product.controller";
import { verifyToken, checkOptionalAuth } from "../middleware/auth.middleware";
import { checkShopOwner } from "../middleware/checkShopOwner";

const ProductRouter = Router();

// ===========================================
// 1. TUYẾN ĐƯỜNG BẢO MẬT (CHO CHỦ SHOP)
// ===========================================
ProductRouter.post("/", verifyToken, checkShopOwner, productController.createProductController);
ProductRouter.put("/:id", verifyToken, checkShopOwner, productController.updateProductController);
ProductRouter.delete("/:id", verifyToken, checkShopOwner, productController.deleteProductController);

// NÂNG CẤP MỚI: Route để bật/tắt trạng thái
ProductRouter.patch(
    "/:id/status",
    verifyToken,
    checkShopOwner,
    productController.updateProductStatusController
);
// ===========================================

ProductRouter.get("/edit-details/:id", verifyToken, checkShopOwner, productController.getCompleteProductForEditController);

// ===========================================
// 2. TUYẾN ĐƯỜNG CÔNG KHAI (CHO KHÁCH HÀNG)
// ===========================================
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
ProductRouter.get("/:id", checkOptionalAuth, productController.getProductOnIdController);

export default ProductRouter;