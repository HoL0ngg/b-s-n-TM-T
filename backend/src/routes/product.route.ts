import { Router } from "express";
import productController from "../controllers/product.controller";
import { checkOptionalAuth } from "../middleware/auth.middleware";

const ProductRouter = Router();

ProductRouter.get("/", productController.getProductOnCategoryIdController);
ProductRouter.get("/productSubCategory", productController.getProductsBySubCategoryController);
ProductRouter.get("/sortproducts", productController.getProductsInPriceOrderController);
ProductRouter.get("/images/:id", productController.getProductImgOnIdController);
ProductRouter.get("/shops/:id", productController.getProductOnShopIdController);
ProductRouter.get("/reviews/:id", productController.getReviewByProductIdController);
ProductRouter.get("/reviews/:id/summary", productController.getReviewSummaryByProductIdController);
ProductRouter.get("/productdetails/:id", productController.getProductDetailsByProductIdController);
ProductRouter.get("/attributeofproductvariants/:id", productController.getAttributeOfProductVariantsController);
ProductRouter.get("/product/search", productController.getProductsByKeyWordController)
ProductRouter.get("/product/:id", checkOptionalAuth, productController.getProductOnIdController);
ProductRouter.get("/recommend/for-you", checkOptionalAuth, productController.getRecommendedProduct);
ProductRouter.get("/recommend/new", productController.getNewProducts);
ProductRouter.get("/recommend/hot", productController.getHotProducts);
export default ProductRouter;
