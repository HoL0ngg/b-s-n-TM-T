import axios from "axios";
import type { ProductType, ProductImageType, ProductReviewType, ProductDetailsType, AttributeOfProductVariantsType } from "../types/ProductType";

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