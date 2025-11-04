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
      style={{ zIndex: 1030 }}
    >
      <div className="container-fluid">
        
        {/* Logo và Nút Toggle */}
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-white me-3" 
            onClick={toggleSidebar}
            title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          >
            <i className={`bi ${isOpen ? 'bi-list' : 'bi-layout-sidebar'}`}></i>
          </button>
          <a className="navbar-brand fw-bold mb-0" href="#">
            <i className="bi bi-shop me-2"></i>
            Shop Manager
          </a>
        </div>

        {/* Icons bên phải */}
        <ul className="navbar-nav ms-auto d-flex flex-row align-items-center gap-2">
          {/* Notification */}
          <li className="nav-item">
            <a className="nav-link position-relative" href="#" title="Thông báo">
              <i className="bi bi-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                    style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}>
                3
              </span>
            </a>
          </li>
          
          {/* Messages */}
          <li className="nav-item">
            <a className="nav-link position-relative" href="#" title="Tin nhắn">
              <i className="bi bi-envelope"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" 
                    style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}>
                5
              </span>
            </a>
          </li>

          {/* Settings */}
          <li className="nav-item">
            <a className="nav-link" href="#" title="Cài đặt">
              <i className="bi bi-gear"></i>
            </a>
          </li>

          {/* Divider */}
          <li className="nav-item">
            <div style={{ 
              width: '1px', 
              height: '24px', 
              backgroundColor: 'rgba(255,255,255,0.3)',
              margin: '0 0.5rem'
            }}></div>
          </li>

          {/* User Dropdown */}
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center gap-2 pe-2"
              href="#"
              id="navbarDropdownMenuLink"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src="./assets/avatar/bear.png"
                className="rounded-circle"
                height="36"
                width="36"
                alt="Avatar"
                style={{ objectFit: 'cover' }}
              />
              <span className="d-none d-md-inline fw-medium">Admin</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end shadow" 
                aria-labelledby="navbarDropdownMenuLink">
              <li>
                <div className="dropdown-item-text">
                  <div className="fw-bold">Admin User</div>
                  <small className="text-muted">admin@shop.com</small>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <i className="bi bi-person me-2"></i>
                  Tài khoản của tôi
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <i className="bi bi-gear me-2"></i>
                  Cài đặt
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <NavLink 
                  to="/" 
                  className="dropdown-item d-flex align-items-center text-primary"
                >
                  <i className="bi bi-arrow-left-circle me-2"></i>
                  Trở về trang chính
                </NavLink>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center text-danger" href="#">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Đăng xuất
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default ShopNavbar;