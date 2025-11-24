import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_URL}/api/payments`;

export const createPayment_vnpay = async (checkoutData: any) => {
    const res = await axios.post(`${API_URL}/vnpay`, checkoutData);
    return res.data;
}

export const createPayment_momo = async (checkoutData: any) => {
    const res = await axios.post(`${API_URL}/momo`, checkoutData);
    return res.data;
}

export const handleShipCod = async (checkoutData: any) => {
    const res = await axios.post(`${API_URL}/cod`, checkoutData);
    return res.data;
}