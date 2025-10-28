// src/layouts/ShopLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Import các component con
import ShopNavbar from '../components/ShopNavbar';
import ShopSidebar from '../components/ShopSidebar';
import ShopFooter from '../components/ShopFooter';

// Import file CSS vừa tạo
import './ShopLayout.css'; 

const ShopLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="shop-layout">
      
      {/* 1. Navbar (Thanh tím cố định trên cùng) */}
      <ShopNavbar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* 2. Sidebar (Thanh trắng cố định bên trái) */}
      <ShopSidebar isOpen={isSidebarOpen} />

      {/* 3. Nội dung chính (bên phải, gồm Trang + Footer) */}
      <div 
        className={`shop-main-content ${isSidebarOpen ? 'open' : 'closed'}`}
      >
        {/* 3a. Nội dung trang (Dashboard, Products...) */}
        <main className="shop-page-content">
          <Outlet /> {/* Đây là nơi các trang con được render */}
        </main>
        
        {/* 3b. Footer (ở dưới cùng) */}
        <ShopFooter />
      </div>
    </div>
  );
};

export default ShopLayout;