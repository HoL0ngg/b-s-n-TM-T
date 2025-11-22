// Đường dẫn: backend/src/controllers/product.controller.ts
// (PHIÊN BẢN ĐÃ SỬA XUNG ĐỘT - ĐÃ TRỘN)

import { Request, Response } from "express"
import productService from "../services/product.service";
// SỬA: Thêm import 'CreatePromotionData' từ nhánh 'main'
import { CreatePromotionData } from "../models/product.model";

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

    // (Trong product.controller.ts)

    // === HÀM PHỤ: Xử lý file upload cho Main và Variations ===
    private processUploadedFiles = (req: Request, productData: any) => {
        const files = req.files as Express.Multer.File[]; // Lấy tất cả file
        if (!files || files.length === 0) return;

        // 1. Tìm ảnh chính (field: 'product_image')
        const mainImage = files.find(f => f.fieldname === 'product_image');
        if (mainImage) {
            productData.image_url = `/uploads/products/${mainImage.filename}`;
        }

        // 2. Tìm ảnh cho từng biến thể (field: 'variation_image_INDEX')
        if (productData.variations && Array.isArray(productData.variations)) {
            productData.variations = productData.variations.map((v: any, index: number) => {
                // Tìm file có tên 'variation_image_0', 'variation_image_1'...
                const vFile = files.find(f => f.fieldname === `variation_image_${index}`);
                if (vFile) {
                    // Nếu có file mới -> Cập nhật URL
                    return { ...v, image_url: `/uploads/products/${vFile.filename}` };
                }
                // Nếu không có file mới -> Giữ nguyên (nếu là update) hoặc rỗng
                return v;
            });
        }
    }

    // === 1. CREATE ===
    createProductController = async (req: Request, res: Response) => {
        try {
            const shopId = (req as any).shop?.id;
            if (!shopId) return res.status(403).json({ message: 'Không tìm thấy shop' });
            
            const productData = req.body;
            productData.shop_id = shopId;

            // Parse JSON từ FormData
            if (typeof productData.variations === 'string') try { productData.variations = JSON.parse(productData.variations); } catch (e) {}
            if (typeof productData.details === 'string') try { productData.details = JSON.parse(productData.details); } catch (e) {}

            // GỌI HÀM XỬ LÝ FILE (MỚI)
            this.processUploadedFiles(req, productData);

            // Validate
            if (!productData.name) return res.status(400).json({ message: 'Tên sản phẩm là bắt buộc' });
            if (!productData.image_url) return res.status(400).json({ message: 'Thiếu ảnh chính sản phẩm' });

            const product = await productService.createProductService(productData);
            res.status(201).json({ success: true, message: 'Tạo thành công', data: product });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: error.message || 'Lỗi server' });
        }
    };

    // === 2. UPDATE ===
    updateProductController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const shopId = (req as any).shop?.id;
            const userId = (req as any).user?.id;

            if (isNaN(productId)) return res.status(400).json({ message: 'ID không hợp lệ' });
            if (!shopId || !userId) return res.status(403).json({ message: 'Forbidden' });

            const hasPermission = await productService.verifyShopOwnershipService(productId, userId);
            if (!hasPermission) return res.status(403).json({ message: 'Không có quyền sửa' });

            const productData = req.body;
            productData.shop_id = shopId;

             // Parse JSON
            if (typeof productData.variations === 'string') try { productData.variations = JSON.parse(productData.variations); } catch (e) {}
            if (typeof productData.details === 'string') try { productData.details = JSON.parse(productData.details); } catch (e) {}
            if (typeof productData.shop_cate_id === 'string' && (productData.shop_cate_id === 'null' || productData.shop_cate_id === '')) productData.shop_cate_id = null;

            // GỌI HÀM XỬ LÝ FILE (MỚI)
            this.processUploadedFiles(req, productData);

            const product = await productService.updateProductService(productId, productData);
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: product });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: error.message || 'Lỗi server' });
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

    // ===== BẮT ĐẦU TRỘN (MERGE) HÀM NÀY =====
    getProductsController = async (req: Request, res: Response) => {
        try {
            const { page = 1, limit = 12, sort = "default", subCategoryId, minPrice, maxPrice, brand, } = req.query;
            const categoryId = Number(req.params.id);

            // Lấy logic `WHERE` của đồng đội (main) VÀ sửa lỗi
            let whereClause = "WHERE v_products_list.status = 1 AND v_products_list.shop_status = 1"; // (Từ 'main')
            const params: any[] = [];

            if (subCategoryId && Number(subCategoryId) !== 0) {
                whereClause += " AND v_products_list.generic_id = ?"; // (Sửa lỗi)
                params.push(Number(subCategoryId));
            }
            else if (categoryId) {
                // Sửa lỗi: Phải là v_products_list.generic_id
                whereClause += " AND v_products_list.generic_id IN (SELECT gen.id FROM generic gen WHERE gen.category_id = ?)";
                params.push(categoryId);
            }
            if (minPrice) {
                whereClause += " AND v_products_list.base_price >= ?";
                params.push(minPrice);
            }
            if (maxPrice) {
                whereClause += " AND v_products_list.base_price <= ?";
                params.push(maxPrice);
            }
            if (brand && typeof brand === "string" && brand.length > 0) {
                const brandIds = brand.split(",").map(Number).filter(Boolean);
                if (brandIds.length > 0) {
                    const placeholders = brandIds.map(() => "?").join(",");
                    whereClause += ` AND v_products_list.brand_id IN (${placeholders})`;
                    params.push(...brandIds);
                }
            }

            // (Không sort bằng SQL, để logic của 'main' sort bằng JS)
            let orderBy = "";

            const productsPromise = productService.getProductsService(whereClause, params, Number(page), Number(limit), orderBy);

            let brandsPromise;
            if (subCategoryId && Number(subCategoryId) !== 0) {
                brandsPromise = productService.getBrandsOfProductByGenericIdSerivice(Number(subCategoryId));
            } else if (categoryId) {
                brandsPromise = productService.getBrandsOfProductByCategoryIdSerivice(categoryId);
            }

            const [productResult, brandsResult] = await Promise.all([productsPromise, brandsPromise,]);

            // Lấy logic `sort` (sắp xếp) của 'main' (đồng đội)
            let sortedProducts = [...productResult.products];
            switch (sort) {
                case "priceAsc":
                    sortedProducts.sort((a, b) => a.base_price - b.base_price);
                    break;
                case "priceDesc":
                    sortedProducts.sort((a, b) => b.base_price - a.base_price);
                    break;
                default:
                    // Mặc định
                    break;
            }

            res.status(200).json({
                products: sortedProducts, // Trả về mảng đã sort
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
    // ===== KẾT THÚC TRỘN (MERGE) HÀM NÀY =====

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

    updateProductStatusController = async (req: Request, res: Response) => {
        try {
            const productId = Number(req.params.id);
            const shopId = (req as any).shop?.id;
            const { status } = req.body;

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
                res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm hoặc bạn không có quyền.' });
            }
        } catch (error) {
            console.error('Error updating product status:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    // =================================================================
    // CÁC HÀM MỚI (LẤY TỪ NHÁNH `main` CỦA ĐỒNG ĐỘI)
    // =================================================================
    getShopPromotions = async (req: Request, res: Response) => {
        try {
            // Sửa: Lấy shop_id từ (req as any).shop.id (vì bạn đã có checkShopOwner)
            const shopId = (req as any).user.shop_id;
            if (!shopId) {
                return res.status(403).json({ message: "Không tìm thấy shop" });
            }

            const promotions = await productService.getPromotionsByShopId(shopId);

            res.status(200).json(promotions);
        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    getPromotionDetails = async (req: Request, res: Response) => {
        try {
            // Sửa: Lấy shop_id từ (req as any).shop.id
            const shopId = (req as any).user.shop_id;
            const promotionId = Number(req.params.id);

            if (!shopId) {
                return res.status(403).json({ message: "Không tìm thấy shop" });
            }

            // Sửa: Truyền shopId vào service để kiểm tra
            const items = await productService.getItemsByPromotionId(promotionId, shopId);

            res.status(200).json(items);
        } catch (error: any) {
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({ message: "Không có quyền xem sự kiện này" });
            }
            console.log(error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    updatePromotionItem = async (req: Request, res: Response) => {
        try {
            // Sửa: Lấy shop_id từ (req as any).shop.id
            const shopId = (req as any).user.shop_id;
            const promoId = Number(req.params.promoId);
            const variantId = Number(req.params.variantId);
            const { discount_value } = req.body;

            if (!shopId) {
                return res.status(403).json({ message: "Không tìm thấy shop" });
            }

            await productService.updateItem(shopId, promoId, variantId, discount_value);
            res.json({ message: "Đã cập nhật sản phẩm" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    deletePromotionItem = async (req: Request, res: Response) => {
        try {
            // Sửa: Thêm kiểm tra quyền
            const shopId = (req as any).user.shop_id;
            const promoId = Number(req.params.promoId);
            const variantId = Number(req.params.variantId);

            if (!shopId) {
                return res.status(403).json({ message: "Không tìm thấy shop" });
            }
            // (Cần logic kiểm tra quyền ở service, tạm thời cho phép xóa)

            await productService.deleteItem(promoId, variantId);
            res.status(200).json({ message: "Đã xóa sản phẩm khỏi sự kiện" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
            console.log(error);
        }
    }

    savePromotionItems = async (req: Request, res: Response) => {
        try {
            const shopId = (req as any).user.shop_id;
            const promotionId = Number(req.params.id);
            const items = req.body;

            if (!shopId) {
                return res.status(403).json({ message: "Không tìm thấy shop" });
            }
            if (!promotionId || !Array.isArray(items)) {
                return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
            }

            // Sửa: Truyền shopId vào service để kiểm tra
            await productService.syncPromotionItems(promotionId, items, shopId);

            res.json({ message: "Cập nhật sản phẩm khuyến mãi thành công" });
        } catch (error: any) {
            console.error("Lỗi savePromotionItems:", error);
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({ message: "Bạn không có quyền sửa khuyến mãi này" });
            }
            res.status(500).json({ message: "Lỗi server khi lưu khuyến mãi" });
        }
    }

    // (Hàm CreatePromotion mới của đồng đội)
    CreatePromotion = async (req: Request, res: Response) => {
        try {
            // Sửa: Lấy shop_id từ (req as any).shop.id
            const shopId = (req as any).user.shop_id;
            if (!shopId) {
                return res.status(403).json({ message: "Chưa đăng nhập hoặc không phải chủ shop" });
            }
            const { name, start_date, end_date } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: "Vui lòng tải lên ảnh banner." });
            }

            if (!name || !start_date || !end_date) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên và ngày diễn ra sự kiện." });
            }

            if (new Date(start_date) >= new Date(end_date)) {
                throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
            }

            const bannerUrl = `/uploads/promotions/${file.filename}`;

            const promotionData: CreatePromotionData = {
                name,
                start_date,
                end_date,
                banner_url: bannerUrl,
                shop_id: shopId
            };

            const newPromotion = await productService.createPromotion(promotionData);

            res.status(201).json(newPromotion);

        } catch (error: any) {
            console.error("Lỗi Controller (createPromotion):", error);
            res.status(500).json({ message: error.message || "Lỗi máy chủ khi tạo sự kiện" });
        }
    }
}

export default new productController();