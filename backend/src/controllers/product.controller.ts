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
                whereClause += " AND products.generic_id = ?";
                params.push(Number(subCategoryId));
            }
            // Nếu không, mới filter theo categoryId (cha của generic_id)
            else if (categoryId) {
                whereClause +=
                    " AND products.generic_id IN (SELECT gen.id FROM generic gen WHERE gen.category_id = ?)";
                params.push(categoryId);
            }
            // --- HẾT PHẦN LOGIC QUAN TRỌNG ---

            // Thêm filter Khoảng giá
            if (minPrice) {
                whereClause += " AND products.base_price >= ?";
                params.push(minPrice);
            }
            if (maxPrice) {
                whereClause += " AND products.base_price <= ?";
                params.push(maxPrice);
            }

            // Thêm filter Brand
            if (brand && typeof brand === "string" && brand.length > 0) {
                const brandIds = brand.split(",").map(Number).filter(Boolean);
                if (brandIds.length > 0) {
                    const placeholders = brandIds.map(() => "?").join(",");
                    whereClause += ` AND products.brand_id IN (${placeholders})`;
                    params.push(...brandIds);
                }
            }

            // 3. Xây dựng 'orderBy'
            let orderBy = "";
            switch (sort) {
                case "priceAsc": // Cập nhật để khớp với front-end
                    orderBy = "ORDER BY products.base_price ASC";
                    break;
                case "priceDesc": // Cập nhật để khớp với front-end
                    orderBy = "ORDER BY products.base_price DESC";
                    break;
                default:
                    orderBy = "";
                    break;
            }

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