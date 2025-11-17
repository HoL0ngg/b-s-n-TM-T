import { Router, Request, Response, NextFunction } from "express"; // Sửa: Thêm Request, Response, NextFunction
import productController from "../controllers/product.controller";
import { verifyToken, checkOptionalAuth } from "../middleware/auth.middleware";
import { checkShopOwner } from "../middleware/checkShopOwner";
import { uploadPromoBanner } from "../config/multer";

const ProductRouter = Router();

// =*******************************************
// SỬA LỖI: Đặt hàm "gác cổng" vào đây
// *******************************************
ProductRouter.post(
    "/", 
    verifyToken, 
    checkShopOwner, 
    productController.createProductController
);
// *******************************************

ProductRouter.put("/:id", verifyToken, checkShopOwner, productController.updateProductController);
ProductRouter.delete("/:id", verifyToken, checkShopOwner, productController.deleteProductController);
ProductRouter.patch("/:id/status", verifyToken, checkShopOwner, productController.updateProductStatusController);
ProductRouter.get("/edit-details/:id", verifyToken, checkShopOwner, productController.getCompleteProductForEditController);

// (Các route GET và PROMOTIONS khác giữ nguyên)
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
ProductRouter.get('/promotions', verifyToken, productController.getShopPromotions);
ProductRouter.get('/promotions/:id/items', verifyToken, productController.getPromotionDetails);
ProductRouter.patch('/promotions/:id/items/:variantid', verifyToken, productController.updatePromotionItem);
ProductRouter.patch('/promotions/:id/items', verifyToken, productController.savePromotionItems);
ProductRouter.delete('/promotions/:promoId/items/:variantId', productController.deletePromotionItem);
ProductRouter.post('/promotions/add', verifyToken, uploadPromoBanner, productController.CreatePromotion); 
ProductRouter.get("/:id", checkOptionalAuth, productController.getProductOnIdController);

export default ProductRouter;