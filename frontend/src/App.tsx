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
import Shop from "./pages/Shop"; 
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
import View from "./pages/Shop/View";
import ProfileShop from "./pages/Shop/Profile";
import ShopProducts from "./pages/Shop/Products";
import ShopCategoriesManager from "./pages/Shop/ShopCategories";
import AddProduct from "./pages/Shop/AddProduct";

// ===== IMPORT FILE MỚI =====
import EditProduct from "./pages/Shop/EditProduct";
// ==========================

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* === 1. CÁC TRANG CÔNG KHAI (DÙNG MAIN LAYOUT) === */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthRedirectRoute><Login /></AuthRedirectRoute>} />
          <Route path="/register" element={<AuthRedirectRoute><Register /></AuthRedirectRoute>} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register-shop" element={<RegisterShop />} />
          <Route path="/shop/:id" element={<Shop />} />
          <Route path="/user" element={<UserLayout />}>
            <Route path="account">
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="address" element={<Address />} />
              <Route path="bank" element={<Bank />} />
            </Route>
            <Route path="purchase" element={<Purchase />} />
          </Route>
          <Route element={<CheckoutLayout />}>
            <Route path="/cart" element={<Cart />}></Route>
            <Route path="/checkout/address" element={<AddressPage />} />
          </Route>
        </Route>

        {/* === 2. KÊNH NGƯỜI BÁN (DÙNG SHOP LAYOUT) === */}
        <Route path="/seller" element={<ShopLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings/view" element={<View />} />
          <Route path="settings/profile" element={<ProfileShop />} />
          
          <Route path="products" element={<ShopProducts />} />
          <Route path="categories" element={<ShopCategoriesManager />} />
          
          <Route path="products/new" element={<AddProduct />} />
          
          {/* ===== ROUTE MỚI ĐỂ SỬA SẢN PHẨM ===== */}
          <Route path="products/edit/:id" element={<EditProduct />} />
          {/* ======================================= */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;