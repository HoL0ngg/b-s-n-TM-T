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

export const deleteProduct = async (product_id: number) => {
    const res = await axios.delete(`${API_URL}/delete/${product_id}`);
    return res.data;
}

export const deleteProductByShopId = async (shop_id: number) => {
    const res = await axios.delete(`${API_URL}/delete-shop/${shop_id}`);
    return res.data;
}

export const createVietQROrder = async (checkoutData: any) => {
    const res = await axios.post(`${API_URL}/vietqr-create`, checkoutData);

    // Backend sẽ trả về { orderId: "DH123", qrDataURL: "data:image/png;base64,..." }
    return res.data;
}