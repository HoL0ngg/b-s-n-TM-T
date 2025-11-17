import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

interface ShopNavbarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const ShopNavbar = ({ isOpen, toggleSidebar }: ShopNavbarProps) => {

  const { user, userProfile, logout } = useAuth();   // ⬅ THÊM userProfile
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      logout();
      navigate("/");
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark fixed-top navbar-custom-dark" style={{ zIndex: 1030 }}>
        <div className="container-fluid">

          {/* Logo + Toggle */}
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-white me-3" 
              onClick={toggleSidebar}
            >
              <i className={`bi ${isOpen ? 'bi-list' : 'bi-layout-sidebar'}`}></i>
            </button>

            <a className="navbar-brand fw-bold mb-0" href="#">
              <i className="bi bi-shop me-2"></i>
              Shop Manager
            </a>
          </div>

          <ul className="navbar-nav ms-auto d-flex flex-row align-items-center gap-2">
            <li className="nav-item dropdown">

              <a
                className="nav-link dropdown-toggle d-flex align-items-center gap-2 pe-2"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-bs-toggle="dropdown"
              >
                {/* === Avatar === */}
                <img
                  src={
                    userProfile?.avatar_url 
                    || "./assets/avatar/bear.png"
                  }
                  className="rounded-circle"
                  height="36"
                  width="36"
                  alt="Avatar"
                  style={{ objectFit: 'cover' }}
                />

                {/* === Username === */}
                <span className="d-none d-md-inline fw-medium">
                  {/* {userProfile?.username || "Admin"} */}
                </span>
              </a>

              <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="navbarDropdownMenuLink">
                
                {/* User Info */}
                <li>
                  <div className="dropdown-item-text">
                    <div className="fw-bold">
                      {userProfile?.username || "Seller Admin"}
                    </div>
                    <small className="text-muted">
                      {user?.email || "admin@shop.com"}
                    </small>
                  </div>
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

                {/* Logout */}
                <li>
                  <a 
                    className="dropdown-item d-flex align-items-center text-danger"
                    href="#"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </a>
                </li>

              </ul>
            </li>
          </ul>
        </div>
      </nav>

      {/* === Loader Overlay === */}
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
};

export default ShopNavbar;
