// src/components/ShopSidebar.tsx
import { NavLink } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';


interface ShopSidebarProps {
  isOpen: boolean;
}

const ShopSidebar = ({ isOpen }: ShopSidebarProps) => {
  return (
    <div className={`shop-sidebar bg-white ${isOpen ? 'open' : 'closed'}`}>
      <nav className="nav nav-pills flex-column p-2 pt-4">

        {/* Link Dashboard */}
        <li className="nav-item mb-1">
          <NavLink to="/seller" className="nav-link text-dark" end>
            <i className="bi bi-speedometer2 me-3 fs-5"></i>
            <span className="sidebar-link-text">Tổng quan</span>
          </NavLink>
        </li>

        {/* --- Nhóm Quản lý Đơn hàng --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Quản lý Đơn hàng
          </span>
        </li>
        {/* Menu xổ xuống cho Đơn hàng */}
        <li className="nav-item">
          <a
            href="#submenu-orders"
            data-bs-toggle="collapse"
            className="nav-link text-dark d-flex justify-content-between"
          >
            <div>
              <i className="bi bi-archive me-3 fs-5"></i>
              <span className="sidebar-link-text">Đơn hàng</span>
            </div>
            {isOpen && <i className="bi bi-chevron-down small"></i>}
          </a>
          <div className="collapse" id="submenu-orders">
            <ul className="nav flex-column ms-4">
              <li>
                {/* 1. Link "Tất cả" PHẢI CÓ 'end' */}
                <NavLink
                  to="/seller/orders"
                  end
                  className="nav-link text-dark small sidebar-link-text"
                >
                  Tất cả
                </NavLink>
              </li>
              <li>
                {/* 2. Các link con phải có đường dẫn khác nhau */}
                <NavLink
                  to="/seller/orders?status=pending"
                  className="nav-link text-dark small sidebar-link-text"
                >
                  Chờ xác nhận
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/seller/orders?status=packing"
                  className="nav-link text-dark small sidebar-link-text"
                >
                  Chờ đóng gói
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/seller/orders?status=shipping"
                  className="nav-link text-dark small sidebar-link-text"
                >
                  Đang giao
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/seller/orders?status=delivered"
                  className="nav-link text-dark small sidebar-link-text"
                >
                  Đã giao
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/seller/orders?status=cancelled"
                  className="nav-link text-dark small sidebar-link-text"
                >
                  Đã hủy
                </NavLink>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <NavLink to="/seller/orders/returns" className="nav-link text-dark">
            <i className="bi bi-arrow-return-left me-3 fs-5"></i>
            <span className="sidebar-link-text">Trả hàng / Hoàn tiền</span>
          </NavLink>
        </li>

        {/* --- Nhóm Quản lý Sản phẩm --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Quản lý Sản phẩm
          </span>
        </li>
        <li className="nav-item">
          {/* 3. Link "Tất cả" này CŨNG PHẢI CÓ 'end' */}
          <NavLink
            to="/seller/products"
            end
            className="nav-link text-dark"
          >
            <i className="bi bi-box-seam me-3 fs-5"></i>
            <span className="sidebar-link-text">Tất cả Sản phẩm</span>
          </NavLink>
        </li>
        <li className="nav-item">
           <NavLink to="/seller/products" className="nav-link text-dark">
            <i className="bi bi-plus-square me-3 fs-5"></i>
            <span className="sidebar-link-text">Loại sản phẩm</span>
          </NavLink>
        </li>

        {/* --- (Các nhóm khác giữ nguyên) --- */}

        {/* --- Nhóm Tài chính --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Tài chính
          </span>
        </li>
        <li className="nav-item">
          <NavLink to="/seller/finance/revenue" className="nav-link text-dark">
            <i className="bi bi-cash-coin me-3 fs-5"></i>
            <span className="sidebar-link-text">Doanh thu</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/seller/finance/bank" className="nav-link text-dark">
            <i className="bi bi-bank me-3 fs-5"></i>
            <span className="sidebar-link-text">Tài khoản Ngân hàng</span>
          </NavLink>
        </li>

        {/* --- Nhóm Quản lý Shop --- */}
        <li className="nav-item mt-2">
          <span className="nav-link text-muted small text-uppercase sidebar-link-text">
            Quản lý Shop
          </span>
        </li>
        <li className="nav-item">
          <a
            href="#submenu-shop"
            data-bs-toggle="collapse"
            className="nav-link text-dark d-flex justify-content-between"
          >
            <div>
              <i className="bi bi-gear me-3 fs-5"></i>
              <span className="sidebar-link-text">Thiết lập Shop</span>
            </div>
            {isOpen && <i className="bi bi-chevron-down small"></i>}
          </a>
          <div className="collapse" id="submenu-shop">
            <ul className="nav flex-column ms-4">
              <li>
                <NavLink to="/seller/settings/profile" className="nav-link text-dark small sidebar-link-text">
                  Hồ sơ Shop
                </NavLink>
              </li>
              <li>
                <NavLink to="/seller/settings/view" className="nav-link text-dark small sidebar-link-text">
                  Giao diện người xem
                </NavLink>
              </li>
            </ul>
          </div>
        </li>

      </nav>
    </div>
  );
};

export default ShopSidebar;