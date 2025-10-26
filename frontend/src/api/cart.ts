import axios from "axios"

const API_URL = "http://localhost:5000/api/cart";

export const addToCart = async (user_id: number, product_id: number, quantity: number) => {
    const response = await axios.post(`${API_URL}/add`, {
        user_id: user_id,
        product_id: product_id,
        quantity: quantity
    });
    return response.data;
}

export const getCartByUserId = async (user_id: number) => {
    const res = await axios.get(`${API_URL}/getCart/${user_id}`);

    return res.data;
}