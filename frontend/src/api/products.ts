import axios from "axios";
import type { ProductType, ProductImageType, ProductReviewType, ProductDetailsType, AttributeOfProductVariantsType, ProductResponseType, UpdatePromoItemDto, PromotionType, PromotionItem } from "../types/ProductType";

const API_URl = "http://localhost:5000/api/products";

export const fecthProductsByID = async (id: string): Promise<ProductType> => {
    const res = await axios.get(`${API_URl}/product/${id}`);
    // console.log(res.data);
    return res.data;
}

export const fecthProductImg = async (id: string): Promise<ProductImageType[]> => {
    const res = await axios.get(`${API_URl}/images/${id}`);
    // console.log(res);
    return res.data;
}

export const fetch5ProductByShopId = async (id: number): Promise<ProductType[]> => {
    const res = await axios.get(`${API_URl}/shops/${id}?type=suggest`);
    // console.log(res.data);
    return res.data;
}

export const fetchProductsByShopId = async (id: number, state: number, cate: number): Promise<ProductType[]> => {
    const sort = state == 1 ? "popular" : state == 2 ? "new" : "hot";
    // console.log(sort);

    const res = await axios.get(`${API_URl}/shops/${id}?type=all&sortBy=${sort}&bst=${cate}`);
    console.log(res.data);
    return res.data;
}

export const fetchReviewByProductId = async (id: number, type?: number): Promise<ProductReviewType[]> => {
    let hihi = "";
    if (type) hihi = `?type=${type}`
    const res = await axios.get(`${API_URl}/reviews/${id}${hihi}`);
    return res.data;
}

export const fetchReviewSummaryByProductId = async (id: number) => {
    const res = await axios.get(`${API_URl}/reviews/${id}/summary`);
    return res.data;
}

export const fetchProductDetails = async (id: number): Promise<ProductDetailsType[]> => {
    const res = await axios.get(`${API_URl}/productdetails/${id}`);
    return res.data;
}

export const fetchAttributeOfProductVariants = async (id: number): Promise<AttributeOfProductVariantsType[]> => {
    const res = await axios.get(`${API_URl}/attributeofproductvariants/${id}`);
    return res.data;
}

const getAuthHeaders = () => {
    return {
        headers: {
            'Authorization': axios.defaults.headers.common['Authorization'] || ''
        }
    };
};

// Create a new product (for shop owner)
export const createProduct = async (shopId: number, productData: any) => {
    try {
        const response = await axios.post(
            API_URl,
            {
                ...productData,
                shop_id: shopId
            },
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// Update an existing product (for shop owner)
export const updateProduct = async (productId: number, productData: any) => {
    try {
        const response = await axios.put(
            `${API_URl}/${productId}`,
            productData,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Delete a product (for shop owner)
export const deleteProduct = async (productId: number) => {
    try {
        await axios.delete(
            `${API_URl}/${productId}`,
            getAuthHeaders()
        );
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
export const apiGetForYouRecommendations = async () => {
    const res = await axios.get(`${API_URl}/recommend/for-you`);
    // console.log(res.data);
    return res.data;
}

export const apiGetHotRecommendations = async () => {
    const res = await axios.get(`${API_URl}/recommend/hot`);
    // console.log(res.data);
    return res.data;
}

export const apiGetNewRecommendations = async () => {
    const res = await axios.get(`${API_URl}/recommend/new`);
    // console.log(res.data);
    return res.data;
}

export const fetchProductsByKeyWord = async (keyword: string): Promise<ProductType[]> => {
    const res = await axios.get(`${API_URl}/product/search?keyword=${keyword}`);
    return res.data;
}

export const fetchTotalProductByShopId = async (shop_id: Number): Promise<number> => {
    const res = await axios.get(`${API_URl}/getTotalProduct/${shop_id}`);
    return res.data;
}
export const fetchProducts = async (query: any, category_id: number) => {
    const params = new URLSearchParams();

    params.append("page", query.page);
    params.append("limit", query.limit);

    if (query.subCategoryId && query.subCategoryId !== 0) {
        params.append('subCategoryId', query.subCategoryId); // Ưu tiên sub
    }
    if (query.sort && query.sort !== "default") {
        params.append('sort', query.sort);
    }
    if (query.minPrice !== null) {
        params.append('minPrice', query.minPrice);
    }
    if (query.maxPrice !== null) {
        params.append('maxPrice', query.maxPrice);
    }
    if (query.brand && query.brand.length > 0) {
        // Chuyển mảng [1, 3] thành chuỗi "1,3"
        params.append('brand', query.brand.join(','));
    }

    // 5. Gọi API
    // `params.toString()` sẽ tạo ra: "page=1&limit=12&categoryId=5&sort=price-asc&..."
    const res = await axios.get(`${API_URl}/category/${category_id}?${params.toString()}`);
    // console.log(res.data);

    return res.data;
}

export const apiGetShopPromotions = async (): Promise<PromotionType[]> => {
    // Frontend gọi: GET /api/promotions
    const res = await axios.get(`${API_URl}/promotions`);
    return res.data;
};

export const apiGetPromotionDetails = async (promotionId: number): Promise<PromotionItem[]> => {
    // Frontend gọi: GET /api/promotions/123/items
    const res = await axios.get(`${API_URl}/promotions/${promotionId}/items`);
    return res.data;
};

export const apiSavePromotionDetails = async (
    promotionId: number,
    items: UpdatePromoItemDto[]
) => {
    // Frontend gọi: PATCH /api/promotions/123/items
    const res = await axios.patch(`${API_URl}/promotions/${promotionId}/items`, items);
    return res.data;
};

export const apiUpdatePromotionItem = async (promoId: number, variantId: number, discountValue: number) => {
    return axios.patch(`${API_URl}/promotions/${promoId}/items/${variantId}`, { discount_value: discountValue });
};

// Xóa 1 item
export const apiDeletePromotionItem = async (promoId: number, variantId: number) => {
    return axios.delete(`${API_URl}/promotions/${promoId}/items/${variantId}`);
};