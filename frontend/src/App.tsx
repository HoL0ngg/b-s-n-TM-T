// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthRedirectRoute from "./components/AuthRedirectRoute";
import ScrollToTop from "./components/ScrollToTop";

// --- Layouts ---
import MainLayout from "./layouts/MainLayout";
import ShopLayout from "./layouts/ShopLayout";
import UserLayout from "./pages/User/UserLayout";
import CheckoutLayout from "./pages/Checkout/CheckoutLayout";

// --- Các trang cho MainLayout ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgetPassword from "./pages/forgetPassword";
import Category from "./pages/Category";
import Shop from "./pages/Shop"; // Trang xem shop (của khách)
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/User/Account/Profile";
import Address from "./pages/User/Account/Address";
import Bank from "./pages/User/Account/Bank";
import Purchase from "./pages/User/Purchase";
import Cart from "./pages/Checkout/Cart";
import { AddressPage } from "./pages/Checkout/AddressPage";

// --- Các trang cho ShopLayout ---
import Dashboard from "./pages/Shop/Dashboard";
import Orders from "./pages/Shop/Orders";
import RegisterShop from './pages/RegisterShop';
import OrderDetail from "./pages/Shop/OrderDetail";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* === 1. CÁC TRANG CÔNG KHAI (DÙNG MAIN LAYOUT) === */}
        {/* Tất cả các route bên trong này sẽ có Navbar/Footer chung */}
        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthRedirectRoute><Login /></AuthRedirectRoute>} />
          <Route path="/register" element={<AuthRedirectRoute><Register /></AuthRedirectRoute>} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register-shop" element={<RegisterShop />} />

          {/* Trang xem shop CÔNG KHAI (của khách) */}
          <Route path="/shop/:id" element={<Shop />} />

          {/* Path của user (dùng UserLayout lồng bên trong MainLayout) */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="account">
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="address" element={<Address />} />
              <Route path="bank" element={<Bank />} />
            </Route>
            <Route path="purchase" element={<Purchase />} />
          </Route>

          {/* Path của checkout (dùng CheckoutLayout lồng bên trong MainLayout) */}
          <Route element={<CheckoutLayout />}>
            <Route path="/cart" element={<Cart />}></Route>
            <Route path="/checkout/address" element={<AddressPage />} />
            {/* <Route path="/checkout/payment" element={<PaymentPage />} /> */}
          </Route>

        </Route>

        {/* === 2. KÊNH NGƯỜI BÁN (DÙNG SHOP LAYOUT) === */}
        {/* Đã đổi path thành "/seller" để tránh xung đột với "/shop/:id" */}
        <Route path="/seller" element={<ShopLayout />}>
          <Route index element={<Dashboard />} />
          {/* 2. THÊM ROUTE MỚI Ở ĐÂY */}
          {/* Route cho Danh sách (List) */}
          <Route path="orders" element={<Orders />} /> 
          {/* Route cho Chi tiết (Detail) */}
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="orders" element={<Orders />} />
          {/* <Route path="products" element={<ShopProducts />} /> */}
        </Route>

        {/* Thêm route 404 (Not Found) nếu cần */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;