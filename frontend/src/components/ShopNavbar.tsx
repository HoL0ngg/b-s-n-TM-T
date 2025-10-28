// src/components/ShopNavbar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

interface ShopNavbarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const ShopNavbar = ({ isOpen, toggleSidebar }: ShopNavbarProps) => {
  return (
    <nav 
      className="navbar navbar-expand navbar-dark fixed-top navbar-custom-dark" 
      style={{ zIndex: 1030 }} // Đảm bảo luôn ở trên cùng
    >
      <div className="container-fluid">
        
        {/* Logo và Nút Toggle */}
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-white me-2" 
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>
          <a className="navbar-brand fw-bold" href="#">
            Shop Admin
          </a>
        </div>




        {/* Icons bên phải */}
        <ul className="navbar-nav ms-auto d-flex flex-row align-items-center">
          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-bell fs-5"></i>
            </a>
          </li>
          <li className="nav-item ms-2">
            <a className="nav-link" href="#">
              <i className="bi bi-envelope fs-5"></i>
            </a>
          </li>
          <li className="nav-item ms-2">
            <a className="nav-link" href="#">
              <i className="bi bi-grid-3x3-gap fs-5"></i>
            </a>
          </li>

          {/* User Dropdown */}
          <li className="nav-item dropdown ms-3">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="navbarDropdownMenuLink"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src="./assets/avatar/bear.png" // Thay bằng ảnh avatar
                className="rounded-circle"
                height="32"
                width="32"
                alt="Avatar"
              />
            </a>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><a className="dropdown-item" href="#">Settings</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <NavLink 
                  to="/" 
                  end 
                  className="nav-link text-black small"
                  >
                  Trở về trang chính
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default ShopNavbar;