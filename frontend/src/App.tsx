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

// --- Các trang cho ShopLayout (ĐÃ GỘP TỪ CẢ 2 NHÁNH) ---
import Dashboard from "./pages/Shop/Dashboard";
import Orders from "./pages/Shop/Orders";
import RegisterShop from './pages/RegisterShop';
import OrderDetail from "./pages/Shop/OrderDetail"; // (Từ 'main')
import View from "./pages/Shop/View";
import ProfileShop from "./pages/Shop/Profile";
import ShopProducts from "./pages/Shop/Products";
import ShopCategoriesManager from "./pages/Shop/ShopCategories"; // (Từ 'qhuykuteo')
import AddProduct from "./pages/Shop/AddProduct"; // (Từ 'qhuykuteo')
import EditProduct from "./pages/Shop/EditProduct"; // (Từ 'qhuykuteo')
import Promotion from "./pages/Shop/Promotion"; // (Từ 'main')

// --Các trang cho AdminLayout (Từ 'main')--
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminShopManagement from "./pages/Admin/AdminShopManagement";
// (Sửa tên file import theo file 'main')
import AdminUserSellersManagement from "./pages/Admin/AdminUserSellersManagement";
import AdminUserBuyersManagement from "./pages/Admin/AdminUserBuyersManagement";
import AdminProductApproval from "./pages/Admin/AdminProductApproval";
import AdminPayouts from "./pages/Admin/AdminPayouts";
import AdminShopDetail from "./pages/Admin/AdminShopDetail";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminCategoriesManagement from "./pages/Admin/AdminCategoriesManagement";

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

          {/* (Route 'Orders' của 'main') */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />

          {/* (Route 'Settings' của 'main') */}
          <Route path="settings/view" element={<View />} />
          <Route path="settings/profile" element={<ProfileShop />} />

          {/* (Các Route 'Products' của bạn 'qhuykuteo') */}
          <Route path="products" element={<ShopProducts />} />
          <Route path="categories" element={<ShopCategoriesManager />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />

          {/* (Route 'Promotion' của 'main') */}
          <Route path="promotion" element={<Promotion />} />
        </Route>

        {/* === 3. TRANG ADMIN (TỪ NHÁNH 'main') === */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="shops" element={<AdminShopManagement />} />
          <Route path="users/sellers" element={<AdminUserSellersManagement />} />
          <Route path="users/buyers" element={<AdminUserBuyersManagement />} />
          <Route path="products" element={<AdminProductApproval />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategoriesManagement />} />
          <Route path="shops/:id" element={<AdminShopDetail />} />
        </Route>

        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;