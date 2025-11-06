import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/Admin/AdminSideBar';
import AdminNavbar from '../components/Admin/AdminNavBar';
import AdminFooter from '../components/Admin/AdminFooter';

// Import các component con
// import AdminNavbar from '../components/admin/AdminNavbar';
// import AdminFooter from '../components/admin/AdminFooter';

const AdminLayout: React.FC = () => {
    // State quản lý việc đóng/mở sidebar được đặt ở đây
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Hàm toggle, sẽ được truyền xuống Navbar
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="d-flex vh-100">

            {/* 1. Sidebar (bên trái) */}
            <AdminSidebar isCollapsed={isCollapsed} />

            {/* 2. Vùng nội dung chính (bên phải, gồm Navbar + Content + Footer) */}
            <div className="flex-grow-1 d-flex flex-column">

                {/* 2a. Navbar (trên cùng) */}
                <AdminNavbar toggleSidebar={toggleSidebar} />

                {/* 2b. Nội dung trang (Outlet) */}
                <main className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
                    <Outlet /> {/* Đây là nơi các trang con được render */}
                </main>

                {/* 2c. Footer (dưới cùng) */}
                <AdminFooter />
            </div>
        </div>
    );
};

export default AdminLayout;