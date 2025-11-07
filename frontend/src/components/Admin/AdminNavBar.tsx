import React from 'react';
import { BsList } from 'react-icons/bs';

// Định nghĩa props
interface AdminNavbarProps {
    toggleSidebar: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ toggleSidebar }) => {
    return (
        <header className="navbar navbar-light bg-white shadow-sm p-3">
            <button
                className="btn btn-outline-secondary"
                onClick={toggleSidebar} // Sử dụng prop
            >
                <BsList size={20} />
            </button>

            <div className="ms-auto">
                <span>Xin chào, Admin!</span>
                {/* Thêm Dropdown, Avatar... ở đây */}
            </div>
        </header>
    );
};

export default AdminNavbar;