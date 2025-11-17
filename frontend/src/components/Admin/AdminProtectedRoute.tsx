import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminProtectedRouteProps {
    children: React.ReactElement;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        // Nếu chưa đăng nhập, đá về trang Login
        return <Navigate to="/admin/login" replace />;
    }

    if (user.role !== 'admin') {
        alert("Tài khoản của bạn không có quyền truy cập vào trang này.");
        // Đã đăng nhập nhưng không phải Admin, đá về trang chủ
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;