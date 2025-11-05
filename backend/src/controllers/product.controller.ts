import { Request, Response } from "express"
import productService from "../services/product.service";

class productController {

    // =================================================================
    // CÁC HÀM GET (CÔNG KHAI) - KHÔNG THAY ĐỔI
    // =================================================================
    getProductOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const user_id = (req as any).user?.id;

            const product = await productService.getProductOnIdService(Number(id));

            if (product && user_id) {
                productService.logView(user_id, Number(product.id))
                    .catch((err: any) => console.error("Lỗi ghi log xem sản phẩm:", err));
            }
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    }

    getProductImgOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const images = await productService.getProductImgOnIdService(Number(id));
            res.status(200).json(images);
        } catch (err) {
            console.log(err);
        }
    }

    getProductOnShopIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const type = req.query.type;
            const sort = req.query.sortBy || "popular";
            const cate = req.query.bst || 0;

            let data;
            switch (type) {
                case 'all':
                    data = await productService.getProductOnShopIdService(Number(id), String(sort), Number(cate));
                    break;
                case 'suggest':
                    data = await productService.get5ProductOnShopIdService(Number(id));
                    break;
                default:
                    // Trả về mảng rỗng nếu 'type' không hợp lệ thay vì lỗi
                    data = [];
                    break;
            }
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    // ... (Các hàm getReview... getProductDetails... getAttribute... giữ nguyên) ...
    getReviewByProductIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const type = req.query.type;
            const product = await productService.getReviewByProductIdService(Number(id), Number(type) || 0);
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
        }
    }

    getReviewSummaryByProductIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const reviews = await productService.getReviewSummaryByProductIdService(Number(id));
            res.status(200).json(reviews);
        } catch (err) {
            console.log(err);
        }
    }

    getProductDetailsByProductIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const productDetail = await productService.getProductDetailsByProductId(Number(id));
            res.status(200).json(productDetail);
        } catch (error) {
            console.log(error);
        }
    }
    getAttributeOfProductVariantsController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const attributes = await productService.getAttributeOfProductVariantsByProductIdService(Number(id));
            res.status(200).json(attributes);
        } catch (error) {
            console.log(error);

        }
    }
    
    // =================================================================
    // CÁC HÀM CRUD (BẢO MẬT) - ĐÃ SỬA LỖI
    // =================================================================

    createProductController = async (req: Request, res: Response) => {
        try {
            // 1. Lấy shop_id TỪ MIDDLEWARE (AN TOÀN), không tin req.body
            const shopId = (req as any).shop?.id;
            if (!shopId) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Không tìm thấy thông tin shop. Bạn có quyền tạo sản phẩm không?' 
                });
            }

            // 2. Lấy data từ body
            const productData = req.body;
            
            // 3. Ghi đè shop_id từ middleware vào productData
            productData.shop_id = shopId;

            // 4. Validate (bỏ check shop_id vì đã lấy từ middleware)
            if (!productData.name || !productData.base_price) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields: name, base_price' 
                });
            }
            
            // 5. Gọi service (file service của bạn đã đúng, không cần sửa)
            const product = await productService.createProductService(productData);
            
            res.status(201).json({ 
                success: true, 
                message: 'Product created successfully',
                data: product 
            });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // UPDATE product
    updateProductController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const productData = req.body;

            // 1. Lấy shop_id và user_id (SĐT) TỪ MIDDLEWARE
            const shopId = (req as any).shop?.id; // ID (number) của shop
            const userId = (req as any).user?.id; // SĐT (string) của user
            
            if (!productId || isNaN(productId)) {
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            }
            if (!shopId || !userId) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // 2. Xác thực chủ sở hữu
            const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            if (!hasPermission) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Bạn không có quyền cập nhật sản phẩm này' 
                });
            }
            
            // 3. Ghi đè shop_id (để đảm bảo an toàn, dù service ko dùng)
            productData.shop_id = shopId;
            
            // 4. Gọi service (file service của bạn đã đúng, không cần sửa)
            const product = await productService.updateProductService(productId, productData);
            
            res.status(200).json({ 
                success: true, 
                message: 'Product updated successfully',
                data: product 
            });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // DELETE product
    deleteProductController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);

            // 1. Lấy user_id (SĐT) TỪ MIDDLEWARE
            const userId = (req as any).user?.id;
            
            if (!productId || isNaN(productId)) {
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            }
            if (!userId) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // 2. Xác thực chủ sở hữu
            const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            if (!hasPermission) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Bạn không có quyền xóa sản phẩm này' 
                });
            }
            
            // 3. Gọi service
            await productService.deleteProductService(productId);
            
            res.status(200).json({ 
                success: true, 
                message: 'Product deleted successfully' 
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // ... (Các hàm getRecommendedProduct, getProductsByKeyWordController... giữ nguyên) ...
    getRecommendedProduct = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const products = await productService.getForYouRecommendations(userId);
            res.status(200).json(products);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getProductsByKeyWordController = async (req: Request, res: Response) => {
        try {
            const keyword = String(req.query.keyword);
            const products = await productService.getProductsByKeyWordService(keyword);
            return res.status(200).json(products);
        } catch (error) {
            console.log(error);
        }
    };
    getNewProducts = async (req: Request, res: Response) => {
        try {
            const products = await productService.getNewProducts();
            return res.status(200).json(products);
        } catch (err) {
            console.log(err);
        }
    }
    getHotProducts = async (req: Request, res: Response) => {
        try {
            const products = await productService.getHotPorducts();
            return res.status(200).json(products);
        } catch (err) {
            console.log(err);
        }
    }
    getProductsController = async (req: Request, res: Response) => {
        try {
            const {
                page = 1, limit = 12, sort = "default",
                subCategoryId, minPrice, maxPrice, brand,
            } = req.query;
            const categoryId = Number(req.params.id); 

            let whereClause = "WHERE 1=1";
            const params: any[] = [];

            if (subCategoryId && Number(subCategoryId) !== 0) {
                whereClause += " AND products.generic_id = ?";
                params.push(Number(subCategoryId));
            }
            else if (categoryId) {
                whereClause +=
                    " AND products.generic_id IN (SELECT gen.id FROM generic gen WHERE gen.category_id = ?)";
                params.push(categoryId);
            }

            if (minPrice) {
                whereClause += " AND products.base_price >= ?";
                params.push(minPrice);
            }
            if (maxPrice) {
                whereClause += " AND products.base_price <= ?";
                params.push(maxPrice);
            }

            if (brand && typeof brand === "string" && brand.length > 0) {
                const brandIds = brand.split(",").map(Number).filter(Boolean);
                if (brandIds.length > 0) {
                    const placeholders = brandIds.map(() => "?").join(",");
                    whereClause += ` AND products.brand_id IN (${placeholders})`;
                    params.push(...brandIds);
                }
            }

            let orderBy = "";
            switch (sort) {
                case "priceAsc": 
                    orderBy = "ORDER BY products.base_price ASC";
                    break;
                case "priceDesc": 
                    orderBy = "ORDER BY products.base_price DESC";
                    break;
                default:
                    orderBy = "";
                    break;
            }

            const productsPromise = productService.getProductsService(
                whereClause, params, Number(page), Number(limit), orderBy
            );
            let brandsPromise;
            if (subCategoryId && Number(subCategoryId) !== 0) {
                brandsPromise = productService.getBrandsOfProductByGenericIdSerivice(Number(subCategoryId));
            } else if (categoryId) {
                brandsPromise = productService.getBrandsOfProductByCategoryIdSerivice(categoryId);
            }
            const [productResult, brandsResult] = await Promise.all([
                productsPromise,
                brandsPromise,
            ]);
            res.status(200).json({
                products: productResult.products,
                totalPages: productResult.totalPages,
                brands: brandsResult,
            });

        } catch (error) {
            console.error("Lỗi tại getProductsController:", error);
            res.status(500).json({
                message: "Lỗi máy chủ nội bộ",
                error: error instanceof Error ? error.message : "Lỗi không xác định",
            });
        }
    };
}
export default new productController();