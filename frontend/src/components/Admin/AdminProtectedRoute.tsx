import React from 'react';
import { Navigate } from 'react-router-dom';

// Giả sử bạn có một cách (ví dụ: Context, Redux) để lấy thông tin user
const useAuth = () => {
    // --- LOGIC GIẢ ĐỊNH ---
    // Thay thế bằng logic thật của bạn
    // Ví dụ: const { user } = useAuthContext();
    const user = {
        username: 'admin_user',
        role: 'admin' // Giả sử user này có role 'admin'
    };
    // const user = null; // Thử đổi thành null để test

    if (user && user.role === 'admin') {
        return { isAuthenticated: true, isAdmin: true };
    }
    if (user) {
        return { isAuthenticated: true, isAdmin: false };
    }
    return { isAuthenticated: false, isAdmin: false };
    // --- KẾT THÚC LOGIC GIẢ ĐỊNH ---
};

interface AdminProtectedRouteProps {
    children: React.ReactElement;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, đá về trang Login
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // Đã đăng nhập nhưng không phải Admin, đá về trang chủ
        return <Navigate to="/" replace />;
    }

    // Nếu là Admin, cho phép truy cập
    return children;
};

export default AdminProtectedRoute;