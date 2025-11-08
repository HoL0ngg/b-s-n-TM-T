import axios from "axios";
import type { ProductType, ProductImageType, ProductReviewType, ProductDetailsType, AttributeOfProductVariantsType, ProductResponseType } from "../types/ProductType";
import { getAuthHeaders } from "./apiHelpers";

const API_URL = "http://localhost:5000/api/products";

// ... (Các hàm GET công khai giữ nguyên) ...
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

// (Hàm CRUD sản phẩm)
export const createProduct = async (productData: any) => {
    // Bỏ `_shopId` vì controller đã tự lấy
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

// ... (Các hàm recommend/search... giữ nguyên) ...
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

// (Hàm lấy thuộc tính)
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

// ========================================================
// NÂNG CẤP MỚI: Thêm hàm bật/tắt trạng thái
// ========================================================
export const updateProductStatus = async (productId: number, status: number) => {
    const response = await axios.patch(
        `${API_URL}/${productId}/status`, 
        { status }, // Gửi { status: 0 } hoặc { status: 1 }
        getAuthHeaders()
    );
    return response.data;
};