import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import ChatbotFloating from "./components/ChatbotFloating";
import Information from "./pages/Information"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart/information" element={<Information />} />
        </Routes>
      </div>
      <ChatbotFloating />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
