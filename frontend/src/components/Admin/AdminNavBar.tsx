import React from 'react';
import { BsList } from 'react-icons/bs';
import { IoCalendarSharp } from "react-icons/io5";
import { formattedDate } from '../../utils/helper';

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
            <div className='ms-4 d-flex align-items-center'>
                <IoCalendarSharp size={28} className='text-primary' />
                <span className='ms-2 fw-semibold'>{formattedDate}</span>
            </div>

            <div className="ms-auto">
                <span>Xin chào, Admin!</span>
                {/* Thêm Dropdown, Avatar... ở đây */}
            </div>
        </header>
    );
};

export default AdminNavbar;