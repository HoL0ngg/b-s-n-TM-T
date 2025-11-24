import React from 'react';
import { BsList } from 'react-icons/bs';
import { IoCalendarSharp } from "react-icons/io5";
import { formattedDate } from '../../utils/helper';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Định nghĩa props
interface AdminNavbarProps {
    toggleSidebar: () => void;
}
const AdminNavbar: React.FC<AdminNavbarProps> = ({ toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/admin/login', { replace: true });
    }
    return (
        <header className="navbar navbar-light bg-white shadow-sm p-3">
            <button
                className="btn btn-outline-secondary"
                onClick={toggleSidebar} // Sử dụng prop
            >
                <BsList size={20} />
            </button>
            <div className='ms-4 d-flex align-items-center'>
                <IoCalendarSharp size={28} className='text-primary' />
                <span className='ms-2 fw-semibold'>{formattedDate}</span>
            </div>

            <div className="ms-auto">
                <span className="fw-bold">Xin chào, Admin!</span>
                <FiLogOut size={20} onClick={handleLogout} className="ms-1 me-3 text-danger" style={{ cursor: 'pointer' }} title="Đăng xuất" />
            </div>
        </header>
    );
};

export default AdminNavbar;