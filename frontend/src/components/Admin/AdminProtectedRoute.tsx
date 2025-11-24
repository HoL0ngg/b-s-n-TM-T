// src/components/AdminProtectedRoute.tsx (hoặc đường dẫn file của bạn)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminProtectedRouteProps {
    children: React.ReactElement;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    // 1. Lấy thêm loading từ context
    const { user, loading } = useAuth();

    // 2. Nếu đang loading (đang check token trong localStorage), hiển thị màn hình chờ
    // Bạn có thể thay thế <div>Loading...</div> bằng một Component Spinner đẹp hơn
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
    }

    // 3. Kiểm tra user
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // 4. Kiểm tra role (Lưu ý: Cần đồng bộ chữ hoa/thường với dữ liệu trong Token)
    // Token của bạn decode ra là 'ADMIN' (hoa), nhưng ở đây bạn check 'admin' (thường).
    // Tốt nhất là convert sang lowercase để so sánh.
    if (user.role?.toLowerCase() !== 'admin') {
        alert("Tài khoản của bạn không có quyền truy cập vào trang này.");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;