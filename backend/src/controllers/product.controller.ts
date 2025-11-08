import { Request, Response } from "express"
import productService from "../services/product.service";

class productController {
    // ... (Tất cả các hàm GET (getProductOnIdController, ...) giữ nguyên) ...
    getProductOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const user_id = (req as any).user?.id;
            const product = await productService.getProductOnIdService(Number(id));
            if (product && user_id) {
                productService.logView(user_id, Number(product.id)).catch((err: any) => console.error("Lỗi ghi log xem sản phẩm:", err));
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
                    data = [];
                    break;
            }
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Lỗi máy chủ" });
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
    
    // --- (Các hàm CRUD (create/update/delete) giữ nguyên) ---
    createProductController = async (req: Request, res: Response) => {
        try {
            const shopId = (req as any).shop?.id;
            if (!shopId) { return res.status(403).json({ success: false, message: 'Không tìm thấy thông tin shop. Bạn có quyền tạo sản phẩm không?' }); }
            const productData = req.body;
            productData.shop_id = shopId;
            if (!productData.name) {
                return res.status(400).json({ success: false, message: 'Tên sản phẩm là bắt buộc' });
            }
            if (productData.variations && productData.variations.length > 0) {
                 if (!productData.attribute_id) {
                     return res.status(400).json({ success: false, message: 'Cần có `attribute_id` khi tạo phân loại' });
                 }
                 for (const v of productData.variations) {
                     if (!v.value || !v.price || v.stock === undefined) {
                         return res.status(400).json({ success: false, message: 'Mỗi phân loại phải có `value`, `price`, và `stock`' });
                     }
                 }
            } else {
                if (!productData.base_price) {
                     return res.status(400).json({ success: false, message: 'Sản phẩm đơn phải có `base_price`' });
                }
            }
            if (productData.details && Array.isArray(productData.details)) {
                for (const d of productData.details) {
                    if (!d.key || !d.value) {
                        return res.status(400).json({ success: false, message: 'Mỗi chi tiết sản phẩm phải có cả "key" và "value"' });
                    }
                }
            }
            const product = await productService.createProductService(productData);
            res.status(201).json({ success: true, message: 'Product created successfully', data: product });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    };
    updateProductController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const productData = req.body;
            const shopId = (req as any).shop?.id;
            const userId = (req as any).user?.id;
            if (!productId || isNaN(productId)) {
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            }
            if (!shopId || !userId) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            if (!hasPermission) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật sản phẩm này' });
            }
            productData.shop_id = shopId;
            if (!productData.name) {
                return res.status(400).json({ success: false, message: 'Tên sản phẩm là bắt buộc' });
            }
            if (productData.variations && productData.variations.length > 0) {
                 if (!productData.attribute_id) {
                     return res.status(400).json({ success: false, message: 'Cần có `attribute_id` khi tạo phân loại' });
                 }
            } else if (!productData.base_price) {
                 return res.status(400).json({ success: false, message: 'Sản phẩm đơn phải có `base_price`' });
            }
            if (productData.details && Array.isArray(productData.details)) {
                for (const d of productData.details) {
                    if (!d.key || !d.value) {
                        return res.status(400).json({ success: false, message: 'Mỗi chi tiết sản phẩm phải có cả "key" và "value"' });
                    }
                }
            }
            const product = await productService.updateProductService(productId, productData);
            res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    };
    deleteProductController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const userId = (req as any).user?.id;
            if (!productId || isNaN(productId)) {
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            }
            if (!userId) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            if (!hasPermission) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa sản phẩm này' });
            }
            await productService.deleteProductService(productId);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    };
    
    // --- (Các hàm GET còn lại giữ nguyên) ---
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
            const { page = 1, limit = 12, sort = "default", subCategoryId, minPrice, maxPrice, brand, } = req.query;
            const categoryId = Number(req.params.id); 
            let whereClause = "WHERE 1=1";
            const params: any[] = [];
            if (subCategoryId && Number(subCategoryId) !== 0) {
                whereClause += " AND products.generic_id = ?";
                params.push(Number(subCategoryId));
            }
            else if (categoryId) {
                whereClause += " AND products.generic_id IN (SELECT gen.id FROM generic gen WHERE gen.category_id = ?)";
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
                case "priceAsc": orderBy = "ORDER BY products.base_price ASC"; break;
                case "priceDesc": orderBy = "ORDER BY products.base_price DESC"; break;
                default: orderBy = ""; break;
            }
            const productsPromise = productService.getProductsService(whereClause, params, Number(page), Number(limit), orderBy);
            let brandsPromise;
            if (subCategoryId && Number(subCategoryId) !== 0) {
                brandsPromise = productService.getBrandsOfProductByGenericIdSerivice(Number(subCategoryId));
            } else if (categoryId) {
                brandsPromise = productService.getBrandsOfProductByCategoryIdSerivice(categoryId);
            }
            const [productResult, brandsResult] = await Promise.all([productsPromise, brandsPromise,]);
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
    getAllAttributesController = async (req: Request, res: Response) => {
        try {
            const attributes = await productService.getAllAttributesService();
            res.status(200).json(attributes);
        } catch (error) {
            console.error("Lỗi khi lấy thuộc tính:", error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
        }
    };
    getCompleteProductForEditController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const shopId = (req as any).shop?.id;
            if (!shopId) {
                return res.status(403).json({ message: "Không tìm thấy thông tin shop." });
            }
            if (!productId) {
                return res.status(400).json({ message: "Thiếu ID sản phẩm." });
            }
            const productData = await productService.getCompleteProductForEditService(productId, shopId);
            res.status(200).json(productData);
        } catch (error: any) {
            console.error("Lỗi khi lấy chi tiết sản phẩm để sửa:", error);
            res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
        }
    };

    // =================================================================
    // NÂNG CẤP MỚI: Thêm hàm bật/tắt trạng thái
    // =================================================================
    updateProductStatusController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const shopId = (req as any).shop?.id;
            const { status } = req.body; // status nên là 0 hoặc 1

            if (status === undefined || (status !== 0 && status !== 1)) {
                return res.status(400).json({ success: false, message: 'Trạng thái (status) không hợp lệ.' });
            }
            if (!shopId) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            const success = await productService.updateProductStatusService(productId, shopId, status);

            if (success) {
                res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công.' });
            } else {
                // Lỗi này xảy ra nếu productId không thuộc shopId
                res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm hoặc bạn không có quyền.' });
            }
        } catch (error) {
            console.error('Error updating product status:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
}
export default new productController();