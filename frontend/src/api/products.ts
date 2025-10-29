import axios from "axios";
import type { ProductType, ProductImageType, ProductReviewType, ProductDetailsType, AttributeOfProductVariantsType } from "../types/ProductType";

const API_URl = "http://localhost:5000/api/products";

export const fecthProducts = async (category_id?: number, page: number = 1, limit: number = 12): Promise<{ data: ProductType[]; totalPages: number }> => {
    const res = await axios.get(`${API_URl}?category_id=${category_id}&page=${page}&limit=${limit}`);
    // console.log(res.data);
    return res.data;
}

export const fecthProductsByID = async (id: string): Promise<ProductType> => {
    const res = await axios.get(`${API_URl}/${id}`);
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
export const fetchProductsInPriceOrder = async (category_id?: number, page: number = 1, limit: number = 12, sort: string = "default"): Promise<{ data: ProductType[], totalPages: number }> => {
    const res = await axios.get(`${API_URl}/sortproducts?category_id=${category_id}&page=${page}&limit=${limit}&sort=${sort}`);
    return res.data
}