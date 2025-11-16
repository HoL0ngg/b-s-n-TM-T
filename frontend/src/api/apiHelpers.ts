import axios from "axios";

// Hàm này lấy token từ `AuthContext` (đã set default)
// để đính kèm vào các request cần bảo mật
export const getAuthHeaders = () => {
    const token = axios.defaults.headers.common['Authorization'];
    
    if (!token) {
        // Cảnh báo này không làm dừng chương trình
        console.warn("Token không tìm thấy trong axios defaults. Đảm bảo AuthContext đã chạy.");
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token || ''
        }
    };
};