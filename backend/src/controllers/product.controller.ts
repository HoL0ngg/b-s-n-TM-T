import { Request, Response } from "express"
import productService from "../services/product.service";

class productController {

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
        }
    }

    getProductImgOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            // const product = await productService.getProductOnIdService(Number(id));
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
                    break;
            }
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
        }
    }

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
    createProductController = async (req: Request, res: Response) => {
        try {
            const productData = req.body;

            // Validate required fields
            if (!productData.shop_id || !productData.name || !productData.base_price) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: shop_id, name, base_price'
                });
            }

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

            // Validate product ID
            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }

            // Optional: Verify shop ownership (if you have auth middleware)
            // const userId = (req as any).user?.id;
            // if (userId) {
            //     const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            //     if (!hasPermission) {
            //         return res.status(403).json({ 
            //             success: false, 
            //             message: 'You do not have permission to update this product' 
            //         });
            //     }
            // }

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

            // Validate product ID
            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }

            // Optional: Verify shop ownership (if you have auth middleware)
            // const userId = (req as any).user?.id;
            // if (userId) {
            //     const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            //     if (!hasPermission) {
            //         return res.status(403).json({ 
            //             success: false, 
            //             message: 'You do not have permission to delete this product' 
            //         });
            //     }
            // }

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



    getRecommendedProduct = async (req: Request, res: Response) => {
        try {
            // Lấy userId (có thể là undefined nếu là khách)
            const userId = (req as any).user?.id;

            // Gọi service, service sẽ tự xử lý logic
            const products = await productService.getForYouRecommendations(userId);
            // console.log(products);
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
            // 1. Lấy tham số
            const {
                page = 1,
                limit = 12,
                sort = "default",
                subCategoryId, // Lấy từ query
                minPrice,
                maxPrice,
                brand,
            } = req.query;

            const categoryId = Number(req.params.id); // Lấy từ param
            // console.log(categoryId);

            // 2. Xây dựng 'whereClause' và 'params'
            let whereClause = "WHERE 1=1";
            const params: any[] = [];

            // --- PHẦN LOGIC QUAN TRỌNG ---
            // Ưu tiên filter theo subCategoryId (chính là generic_id)
            if (subCategoryId && Number(subCategoryId) !== 0) {
                whereClause += " AND v_products_list.generic_id = ?";
                params.push(Number(subCategoryId));
            }
            // Nếu không, mới filter theo categoryId (cha của generic_id)
            else if (categoryId) {
                whereClause +=
                    " AND generic_id IN (SELECT gen.id FROM generic gen WHERE gen.category_id = ?)";
                params.push(categoryId);
            }
            // --- HẾT PHẦN LOGIC QUAN TRỌNG ---

            // Thêm filter Khoảng giá
            if (minPrice) {
                whereClause += " AND v_products_list.base_price >= ?";
                params.push(minPrice);
            }
            if (maxPrice) {
                whereClause += " AND v_products_list.base_price <= ?";
                params.push(maxPrice);
            }

            // Thêm filter Brand
            if (brand && typeof brand === "string" && brand.length > 0) {
                const brandIds = brand.split(",").map(Number).filter(Boolean);
                if (brandIds.length > 0) {
                    const placeholders = brandIds.map(() => "?").join(",");
                    whereClause += ` AND v_products_list.brand_id IN (${placeholders})`;
                    params.push(...brandIds);
                }
            }

            // 3. Xây dựng 'orderBy'
            let orderBy = "";

            // 4. Gọi Service
            const productsPromise = productService.getProductsService(
                whereClause,
                params,
                Number(page),
                Number(limit),
                orderBy
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

            //Sort lại sản phẩm sau khi lấy ra 
            let sortedProducts = [...productResult.products];
            switch (sort) {
                case "priceAsc": // Cập nhật để khớp với front-end
                    sortedProducts.sort((a, b) => a.base_price - b.base_price);
                    break;
                case "priceDesc": // Cập nhật để khớp với front-end
                    sortedProducts.sort((a, b) => b.base_price - a.base_price);
                    break;
                default:
                    orderBy = "ORDER BY v_products_list.created_at DESC";
                    break;
            }
            res.status(200).json({
                products: sortedProducts,
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

    getShopPromotions = async (req: Request, res: Response) => {
        try {
            const shopId = (req as any).user.shop_id; // Lấy từ middleware

            const promotions = await productService.getPromotionsByShopId(shopId);

            res.status(200).json(promotions);
        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    getPromotionDetails = async (req: Request, res: Response) => {
        try {
            const shopId = (req as any).user.shop_id;
            const promotionId = Number(req.params.id);

            const items = await productService.getItemsByPromotionId(promotionId);

            res.status(200).json(items);
        } catch (error: any) {
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({ message: "Không có quyền xem sự kiện này" });
            }
            console.log(error);

            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }
}

export default new productController();