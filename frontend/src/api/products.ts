import axios from "axios";
// Gộp Type từ cả 2 nhánh
import type { ProductType, ProductImageType, ProductReviewType, ProductDetailsType, AttributeOfProductVariantsType, ProductResponseType, UpdatePromoItemDto, PromotionType, PromotionItem, CreatePromotionData } from "../types/ProductType";
// Import hàm helper (chúng ta sẽ tạo file này)
import { getAuthHeaders } from "./apiHelpers";

// Sửa lỗi gõ chữ
const API_URL = "http://localhost:5000/api/products";

// (Các hàm GET công khai giữ nguyên, lấy từ code của bạn)
export const fetchProductsByID = async (id: string): Promise<ProductType> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}
export const fetchProductImg = async (id: string): Promise<ProductImageType[]> => {
    const res = await axios.get(`${API_URL}/${id}/images`);
    return res.data;
}
export const fetch5ProductByShopId = async (id: number): Promise<ProductType[]> => {
    const res = await axios.get(`${API_URL}/shop/${id}?type=suggest`);
    return res.data;
}

// Lấy phiên bản code của bạn (đã sửa đúng route)
export const fetchProductsByShopId = async (id: number, state: number, cate: number): Promise<ProductType[]> => {
    const sort = state == 1 ? "popular" : state == 2 ? "new" : "hot";
    const res = await axios.get(`${API_URL}/shop/${id}?type=all&sortBy=${sort}&bst=${cate}`);
    return res.data;
}
export const fetchReviewByProductId = async (id: number, type?: number): Promise<ProductReviewType[]> => {
    let hihi = "";
    if (type) hihi = `?type=${type}`
    const res = await axios.get(`${API_URL}/${id}/reviews${hihi}`);
    return res.data;
}
export const fetchReviewSummaryByProductId = async (id: number) => {
    const res = await axios.get(`${API_URL}/${id}/review-summary`);
    return res.data;
}
export const fetchProductDetails = async (id: number): Promise<ProductDetailsType[]> => {
    const res = await axios.get(`${API_URL}/${id}/details`);
    return res.data;
}
export const fetchAttributeOfProductVariants = async (id: number): Promise<AttributeOfProductVariantsType[]> => {
    const res = await axios.get(`${API_URL}/${id}/attributes`);
    return res.data;
}



export const createProduct = async (productData: FormData) => { 
    try {  
        const response = await axios.post(API_URL, productData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};
export const updateProduct = async (productId: number, productData: any) => {
    try {
        const response = await axios.put(`${API_URL}/${productId}`, productData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};
export const deleteProduct = async (productId: number) => {
    try {
        await axios.delete(`${API_URL}/${productId}`, getAuthHeaders());
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// (Các hàm recommend/search... giữ nguyên)
export const apiGetForYouRecommendations = async () => {
    const res = await axios.get(`${API_URL}/recommend/for-you`);
    return res.data;
}
export const apiGetHotRecommendations = async () => {
    const res = await axios.get(`${API_URL}/recommend/hot`);
    return res.data;
}
export const apiGetNewRecommendations = async () => {
    const res = await axios.get(`${API_URL}/recommend/new`);
    return res.data;
}
export const fetchProductsByKeyWord = async (keyword: string): Promise<ProductType[]> => {
    const res = await axios.get(`${API_URL}/product/search?keyword=${keyword}`);
    return res.data;
}
export const fetchProducts = async (query: any, category_id: number): Promise<ProductResponseType> => {
    const params = new URLSearchParams();
    params.append("page", query.page);
    params.append("limit", query.limit);
    if (query.subCategoryId && query.subCategoryId !== 0) {
        params.append('subCategoryId', query.subCategoryId);
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
        params.append('brand', query.brand.join(','));
    }
    const res = await axios.get(`${API_URL}/category/${category_id}?${params.toString()}`);
    return res.data;
}

// (Hàm lấy thuộc tính - của bạn (qhuykuteo))
export interface AttributeType {
    id: number;
    name: string;
}
export const fetchProductAttributes = async (): Promise<AttributeType[]> => {
    const res = await axios.get(`${API_URL}/attributes/all`, getAuthHeaders());
    return res.data;
};
export const fetchProductForEdit = async (productId: string | number): Promise<any> => {
    const res = await axios.get(`${API_URL}/edit-details/${productId}`, getAuthHeaders());
    return res.data;
};

// (Hàm bật/tắt trạng thái - của bạn (qhuykuteo))
export const updateProductStatus = async (productId: number, status: number) => {
    const response = await axios.patch(
        `${API_URL}/${productId}/status`, 
        { status }, 
        getAuthHeaders()
    );
    return response.data;
};

// (Các hàm Khuyến mãi MỚI - của đồng đội (main))
export const apiGetShopPromotions = async (): Promise<PromotionType[]> => {
    const res = await axios.get(`${API_URL}/promotions`, getAuthHeaders()); // Sửa: Thêm getAuthHeaders
    return res.data;
};

export const apiGetPromotionDetails = async (promotionId: number): Promise<PromotionItem[]> => {
    const res = await axios.get(`${API_URL}/promotions/${promotionId}/items`, getAuthHeaders()); // Sửa: Thêm getAuthHeaders
    return res.data;
};

export const apiSavePromotionDetails = async (
    promotionId: number,
    items: UpdatePromoItemDto[]
) => {
    const res = await axios.patch(`${API_URL}/promotions/${promotionId}/items`, items, getAuthHeaders()); // Sửa: Thêm getAuthHeaders
    return res.data;
};

export const apiUpdatePromotionItem = async (promoId: number, variantId: number, discountValue: number) => {
    return axios.patch(`${API_URL}/promotions/${promoId}/items/${variantId}`, { discount_value: discountValue }, getAuthHeaders()); // Sửa: Thêm getAuthHeaders
};

export const apiDeletePromotionItem = async (promoId: number, variantId: number) => {
    return axios.delete(`${API_URL}/promotions/${promoId}/items/${variantId}`, getAuthHeaders()); // Sửa: Thêm getAuthHeaders
};

export const apiCreatePromotion = async (data: CreatePromotionData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('banner_image', data.banner_image);

    // SỬA LỖI: Thêm getAuthHeaders() vì route này được bảo mật
    const res = await axios.post(`${API_URL}/promotions/add`, formData, getAuthHeaders());
    return res.data;
};