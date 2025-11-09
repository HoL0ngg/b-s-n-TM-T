import axios from "axios";

const API_URL = "http://localhost:5000/api/shopinfo";

export const createShopInfo = async (shopData: any) => {
  const res = await axios.post(`${API_URL}/register`, shopData);
  return res.data;
};
export const updateShopInfo = async (shopId: number, shopData: any) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(
    `${API_URL}/update/${shopId}`,
    shopData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return res.data;
};