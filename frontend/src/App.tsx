import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Profile from "./pages/Profile";
import ForgetPassword from "./pages/forgetPassword";
import ProductDetail from "./pages/ProductDetail";

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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart/information" element={<Information />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
      <ChatbotFloating />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
