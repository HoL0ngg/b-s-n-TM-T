import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface ShopSidebarProps {
  isOpen: boolean;
}

const ShopSidebar = ({ isOpen }: ShopSidebarProps) => {
  const location = useLocation();

  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  const currentStatus = searchParams.get("status");
  
  return (
    <div className={`shop-sidebar bg-white ${isOpen ? "open" : "closed"}`}>
      <nav className="nav nav-pills flex-column p-2 pt-4">
        {/* --- Dashboard --- */}
        <li className="nav-item mb-1">
          <NavLink to="/seller" end className="nav-link text-dark">
            <i className="bi bi-speedometer2 me-3 fs-5"></i>
            <span className="sidebar-link-text">Tổng quan</span>
          </NavLink>
        </li>

        {/* --- Quản lý Đơn hàng --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Quản lý Đơn hàng
          </span>
        </li>

        <li className="nav-item">
          <NavLink to="/seller/orders" className="nav-link text-dark">
            <i className="bi bi-archive me-3 fs-5"></i>
            <span className="sidebar-link-text">Đơn hàng</span>
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/seller/orders/returns" className="nav-link text-dark">
            <i className="bi bi-arrow-return-left me-3 fs-5"></i>
            <span className="sidebar-link-text">Trả hàng / Hoàn tiền</span>
          </NavLink>
        </li>

        {/* --- Quản lý Sản phẩm --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Quản lý Sản phẩm
          </span>
        </li>
        
        <li className="nav-item">
          <NavLink to="/seller/products" end className="nav-link text-dark">
            <i className="bi bi-box-seam me-3 fs-5"></i>
            <span className="sidebar-link-text">Tất cả sản phẩm</span>
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink to="/seller/categories" className="nav-link text-dark">
            <i className="bi bi-grid me-3 fs-5"></i>
            <span className="sidebar-link-text">Danh mục sản phẩm</span>
          </NavLink>
        </li>

        {/* --- Marketing --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Marketing
          </span>
        </li>
        
        <li className="nav-item">
          <NavLink to="/seller/promotion" className="nav-link text-dark">
            <i className="bi bi-tag me-3 fs-5"></i>
            <span className="sidebar-link-text">Quản lý giảm giá</span>
          </NavLink>
        </li>

        {/* --- Quản lý Shop --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Quản lý Shop
          </span>
        </li>
        
        <li className="nav-item">
          <NavLink to="/seller/settings/profile" className="nav-link text-dark">
            <i className="bi bi-gear me-3 fs-5"></i>
            <span className="sidebar-link-text">Thiết lập Shop</span>
          </NavLink>
        </li>
      </nav>
    </div>
  );
};

export default ShopSidebar;