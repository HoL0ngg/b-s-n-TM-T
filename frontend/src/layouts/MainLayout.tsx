// src/layouts/MainLayout.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotFloating from "../components/ChatbotFloating";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: "80vh" }}>
        <Outlet />
      </div>
      <Footer />
      <ChatbotFloating />
    </>
  );
}
