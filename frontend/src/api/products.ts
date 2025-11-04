import axios from "axios";
import type { ProductType, ProductImageType, ProductReviewType, ProductDetailsType, AttributeOfProductVariantsType, ProductResponseType } from "../types/ProductType";

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
    // console.log(res.data);
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
    return res.data;
}
