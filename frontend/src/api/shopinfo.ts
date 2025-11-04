import axios from "axios";

const API_URL = "http://localhost:5000"; 

export const createShopInfo = async (shopData: any) => {
    const res = await axios.post(`${API_URL}/api/shop_info/register`, shopData);
    return res.data;
};
export const updateShopInfo = async (shopId: number, shopData: any) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(
    `${API_URL}/api/shop_info/update/${shopId}`, 
    shopData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return res.data;
};