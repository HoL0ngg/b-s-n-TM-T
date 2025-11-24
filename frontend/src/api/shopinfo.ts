import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/shopinfo`;

export const createShopInfo = async (shopData: any) => {
  const res = await axios.post(`${API_URL}/register`, shopData);
  return res.data;
};
// shopinfo.ts
export const updateShopInfo = async (shopId: number, shopData: any) => {
  const token = localStorage.getItem('token');

  // ✅ Debug token
  console.log('🔑 Token check:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token?.substring(0, 20) + '...'
  });

  if (!token) {
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại!');
  }

  console.log('📡 API Call:', {
    url: `${API_URL}/update/${shopId}`,
    shopId: shopId,
    headers: {
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    }
  });

  const res = await axios.put(
    `${API_URL}/update/${shopId}`,
    shopData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data;
};
export const getShopInfoByShopId = async (shopId: number) => {
  const res = await axios.get(`${API_URL}/shop/${shopId}`);
  return res.data;
};

export const getShopInfoByUserId = async (userId: number) => {
  const res = await axios.get(`${API_URL}/user/${userId}`);
  return res.data;
};