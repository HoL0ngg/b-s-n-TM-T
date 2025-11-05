import { Router } from "express";
import productController from "../controllers/product.controller";
import { verifyToken, checkOptionalAuth } from "../middleware/auth.middleware";
import { checkShopOwner } from "../middleware/checkShopOwner";

const ProductRouter = Router();

// ===========================================
// TUYẾN ĐƯỜNG BẢO MẬT (CHO CHỦ SHOP)
// ===========================================
// Sửa lỗi: Thêm verifyToken và checkShopOwner
ProductRouter.post(
    "/",
    verifyToken,
    checkShopOwner,
    productController.createProductController
);

ProductRouter.put(
    "/:id",
    verifyToken,
    checkShopOwner,
    productController.updateProductController
);

ProductRouter.delete(
    "/:id",
    verifyToken,
    checkShopOwner,
    productController.deleteProductController
);

// ===========================================
// TUYẾN ĐƯỜNG CÔNG KHAI (CHO KHÁCH HÀNG)
// (Sắp xếp lại thứ tự: Các route CỤ THỂ phải nằm TRƯỚC route CHUNG)
// ===========================================

// Search (cụ thể)
ProductRouter.get("/product/search", productController.getProductsByKeyWordController);

// Recommend (cụ thể)
ProductRouter.get("/recommend/for-you", checkOptionalAuth, productController.getRecommendedProduct);
ProductRouter.get("/recommend/new", productController.getNewProducts);
ProductRouter.get("/recommend/hot", productController.getHotProducts);

// Các route có :id nhưng có tiền tố (vẫn cụ thể)
ProductRouter.get("/category/:id", productController.getProductsController);
ProductRouter.get("/shops/:id", productController.getProductOnShopIdController); // File của bạn là /shops/:id
ProductRouter.get("/images/:id", productController.getProductImgOnIdController); // File của bạn là /images/:id
ProductRouter.get("/reviews/:id", productController.getReviewByProductIdController);
ProductRouter.get("/reviews/:id/summary", productController.getReviewSummaryByProductIdController);
ProductRouter.get("/productdetails/:id", productController.getProductDetailsByProductIdController);
ProductRouter.get("/attributeofproductvariants/:id", productController.getAttributeOfProductVariantsController);

// GET by ID (chung chung) phải để cuối cùng
// Sửa lỗi: Gộp 2 route /:id và /product/:id thành 1 route chuẩn
ProductRouter.get("/:id", checkOptionalAuth, productController.getProductOnIdController);


export default ProductRouter;