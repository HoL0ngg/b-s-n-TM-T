import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirectRoute from "./components/AuthRedirectRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import ChatbotFloating from "./components/ChatbotFloating";
import Information from "./pages/Information"
import ScrollToTop from "./components/ScrollToTop";
import Category from "./pages/Category";
import ForgetPassword from "./pages/forgetPassword";
import UserLayout from "./pages/User/UserLayout";
import Profile from "./pages/User/Account/Profile";
import Address from "./pages/User/Account/Address";
import Purchase from "./pages/User/Purchase";
import ShopApp from "./pages/Shop";
import Bank from "./pages/User/Account/Bank";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <div style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthRedirectRoute><Login /></AuthRedirectRoute>} />
          <Route path="/register" element={<AuthRedirectRoute><Register /></AuthRedirectRoute>} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart/information" element={<Information />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/shop/*" element={<ShopApp />} />

          {/* Path của user */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="account">
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="address" element={<Address />} />
              <Route path="bank" element={<Bank />} />
            </Route>
            <Route path="purchase" element={<Purchase />} />
          </Route>
        </Routes>
      </div>
      <ChatbotFloating />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
