import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiShoppingBag,
    FiUsers,
    FiBox,
    FiDollarSign,
    FiChevronDown,
} from 'react-icons/fi';
import { LiaShippingFastSolid } from "react-icons/lia";

// Định nghĩa props
interface AdminSidebarProps {
    isCollapsed: boolean;
}

// Định nghĩa kiểu cho menu
interface MenuItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    path?: string; // Dành cho các link đơn
    pathPrefix?: string; // Dành cho các mục cha
    children?: {
        key: string;
        label: string;
        path: string;
    }[];
}

// Cập nhật cấu trúc menu
const menuItems: MenuItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <FiHome />,
        path: '/admin'
    },
    {
        key: 'shops',
        label: 'Quản lý Shop',
        icon: <FiShoppingBag />,
        path: '/admin/shops'
    },
    {
        key: 'users',
        label: 'Quản lý người dùng',
        icon: <FiUsers />,
        pathPrefix: '/admin/users', // Dùng để xác định active state
        children: [
            { key: 'sellers', label: 'Sellers', path: '/admin/users/sellers' },
            { key: 'buyers', label: 'Buyers', path: '/admin/users/buyers' },
        ],
    },
    {
        key: 'products',
        label: 'Kiểm duyệt sản phẩm',
        icon: <FiBox />,
        path: '/admin/products'
    },
    {
        key: 'payouts',
        label: 'Đối soát',
        icon: <FiDollarSign />,
        path: '/admin/payouts'
    },
    {
        key: 'orders',
        label: 'Quản lý đơn hàng',
        icon: <LiaShippingFastSolid />,
        path: '/admin/orders'
    },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed }) => {
    const location = useLocation();

    // Logic tìm menu active
    const getSelectedKey = () => {
        const allPaths = [
            ...menuItems.filter(item => item.path).map(item => item.path!),
            ...menuItems
                .filter(item => item.children)
                .flatMap(item => item.children!.map(child => child.path)),
        ];

        const matchedKey = allPaths
            .sort((a, b) => b.length - a.length) // Ưu tiên đường dẫn dài hơn (cụ thể hơn)
            .find(key => location.pathname.startsWith(key));

        return matchedKey || '/admin';
    };
    const activeKey = getSelectedKey();

    return (
        <aside
            className={`sidebar bg-light text-white d-flex flex-column ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
        >
            {/* Logo */}
            <div className="d-flex align-items-center justify-content-center p-3 fs-5 fw-bold text-black border-bottom border-2" style={{ height: '64px' }}>
                {isCollapsed ? 'AP' : 'ADMIN PAGE'}
            </div>

            {/* Menu (dùng nav-pills của Bootstrap) */}
            <ul className="nav nav-pills flex-column mb-auto">
                {menuItems.map(item => {
                    // TRƯỜNG HỢP CÓ MENU CON
                    if (item.children) {
                        const isParentActive = activeKey.startsWith(item.pathPrefix!);
                        return (
                            <li className="nav-item" key={item.key}>
                                {/* Link cha (dùng để toggle) */}
                                <a
                                    href={`#${item.key}-submenu`}
                                    data-bs-toggle="collapse"
                                    aria-expanded={isParentActive}
                                    className={`nav-link d-flex justify-content-between align-items-center ${isParentActive ? 'bg-primary text-white' : 'text-primary'}`}
                                >
                                    <div className="d-flex align-items-center">
                                        <span className="menu-icon">{item.icon}</span>
                                        {!isCollapsed && <span className='ms-2'>{item.label}</span>}
                                    </div>
                                    {/* Mũi tên (chỉ hiển thị khi không collapse) */}
                                    {!isCollapsed && (
                                        <FiChevronDown
                                            style={{
                                                transition: 'transform 0.2s',
                                                transform: isParentActive ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                        />
                                    )}
                                </a>
                                {/* Các link con (trong div collapse) */}
                                <div
                                    className={`collapse ${isParentActive ? 'show' : ''}`}
                                    id={`${item.key}-submenu`}
                                >
                                    <ul className="nav flex-column ps-4">
                                        {item.children.map(child => (
                                            <li className="nav-item mt-2" key={child.key}>
                                                <Link
                                                    to={child.path}
                                                    className={`nav-link ${child.path === activeKey ? 'bg-primary text-white' : 'text-primary'}`}
                                                >
                                                    {!isCollapsed && child.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        );
                    }

                    // TRƯỜNG HỢP LINK ĐƠN (như cũ)
                    return (
                        <li className="nav-item" key={item.key}>
                            <Link
                                to={item.path!}
                                className={`nav-link ${item.path === activeKey ? 'text-white bg-primary' : 'text-primary'}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                {!isCollapsed && <span className='ms-2'>{item.label}</span>}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* Footer của Sidebar */}
            <div className="p-3 border-top border-secondary">
                {!isCollapsed && <span>User Info</span>}
            </div>
        </aside>
    );
};

export default AdminSidebar;