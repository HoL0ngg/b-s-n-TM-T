import axios from "axios";
import type { ProductType, ProductImageType } from "../types/ProductType";

const API_URl = "http://localhost:5000/api/products";

export const fecthProducts = async (category_id?: Number): Promise<ProductType[]> => {
    const res = await axios.get(`${API_URl}?category_id=${category_id}`);
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

export const fetch5ProductByShopId = async (id: Number): Promise<ProductType[]> => {
    const res = await axios.get(`${API_URl}/shops/${id}`);
    console.log(res.data);
    return res.data;
}