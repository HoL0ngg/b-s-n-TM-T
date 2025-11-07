import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiShoppingBag,
    FiUsers,
    FiBox,
    FiDollarSign
} from 'react-icons/fi';

// Định nghĩa props
interface AdminSidebarProps {
    isCollapsed: boolean;
}

// Định nghĩa menu (có thể chuyển ra file riêng nếu muốn)
const menuItems = [
    { key: '/admin', label: 'Dashboard', icon: <FiHome /> },
    { key: '/admin/shops', label: 'Quản lý Shop', icon: <FiShoppingBag /> },
    { key: '/admin/users', label: 'Quản lý User', icon: <FiUsers /> },
    { key: '/admin/products', label: 'Kiểm duyệt Sản phẩm', icon: <FiBox /> },
    { key: '/admin/payouts', label: 'Đối soát', icon: <FiDollarSign /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed }) => {
    const location = useLocation();

    // Logic tìm menu active
    const getSelectedKey = () => {
        const matchedKey = menuItems
            .map(item => item.key)
            .sort((a, b) => b.length - a.length)
            .find(key => location.pathname.startsWith(key));
        return matchedKey || '/admin';
    };
    const activeKey = getSelectedKey();

    return (
        <aside
            className={`sidebar bg-dark text-white d-flex flex-column ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
        >
            {/* Logo */}
            <div className="d-flex align-items-center justify-content-center p-3 fs-5 fw-bold" style={{ height: '64px' }}>
                {isCollapsed ? 'AP' : 'ADMIN PAGE'}
            </div>

            {/* Menu (dùng nav-pills của Bootstrap) */}
            <ul className="nav nav-pills flex-column mb-auto">
                {menuItems.map(item => (
                    <li className="nav-item" key={item.key}>
                        <Link
                            to={item.key}
                            className={`nav-link ${item.key === activeKey ? 'active' : ''}`}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            {/* Ẩn text khi collapsed */}
                            {!isCollapsed && <span className='ms-2'>{item.label}</span>}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Footer của Sidebar */}
            <div className="p-3 border-top border-secondary">
                {!isCollapsed && <span>User Info</span>}
            </div>
        </aside>
    );
};

export default AdminSidebar;