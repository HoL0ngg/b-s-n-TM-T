import { Router } from "express";
import productController from "../controllers/product.controller";
import { checkOptionalAuth, verifyToken } from "../middleware/auth.middleware";

const ProductRouter = Router();

ProductRouter.get("/category/:id", productController.getProductsController);
ProductRouter.get("/images/:id", productController.getProductImgOnIdController);
ProductRouter.get("/shops/:id", productController.getProductOnShopIdController);
ProductRouter.get("/reviews/:id", productController.getReviewByProductIdController);
ProductRouter.get("/reviews/:id/summary", productController.getReviewSummaryByProductIdController);
ProductRouter.get("/productdetails/:id", productController.getProductDetailsByProductIdController);
ProductRouter.get("/attributeofproductvariants/:id", productController.getAttributeOfProductVariantsController);

ProductRouter.post("/", productController.createProductController);
ProductRouter.put("/:id", productController.updateProductController);
ProductRouter.delete("/:id", productController.deleteProductController);

// GET by ID phải để cuối cùng để tránh conflict
// ProductRouter.get("/:id", productController.getProductOnIdController);

ProductRouter.get("/product/search", productController.getProductsByKeyWordController)
ProductRouter.get("/product/:id", checkOptionalAuth, productController.getProductOnIdController);
ProductRouter.get("/recommend/for-you", checkOptionalAuth, productController.getRecommendedProduct);
ProductRouter.get("/recommend/new", productController.getNewProducts);
ProductRouter.get("/recommend/hot", productController.getHotProducts);

ProductRouter.get('/promotions', verifyToken, productController.getShopPromotions);
ProductRouter.get('/promotions/:id/items', verifyToken, productController.getPromotionDetails);

export default ProductRouter;
