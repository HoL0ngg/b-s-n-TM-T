import axios from "axios"

const API_URL = "http://localhost:5000/api/cart";

export const addToCart = async (product_id: number, quantity: number) => {
    const response = await axios.post(`${API_URL}/add`, {
        product_id: product_id,
        quantity: quantity
    });
    return response.data;
}

export const getCartByUserId = async () => {
    const res = await axios.get(`${API_URL}/getCart`);
    console.log(res.data);

    return res.data;
}

export const updateProductQuantity = async (product_id: number, quantity: number) => {
    const res = await axios.patch(`${API_URL}/updateCart/${product_id}`, {
        quantity: quantity
    });

    return res.data;
}