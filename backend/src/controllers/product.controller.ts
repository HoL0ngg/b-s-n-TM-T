import { Request, Response } from "express"
import productService from "../services/product.service";

class productController {
    getProductOnCategoryIdController = async (req: Request, res: Response) => {
        try {
            const category_id = req.query.category_id;
            const product = await productService.getProductOnCategoryIdService(Number(category_id));
            res.status(200).json(product);
        } catch (err) {
            console.log(err);
        }
    }

    getProductOnIdController = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const product = await productService.getProductOnIdService(Number(id));
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
}

export default new productController();