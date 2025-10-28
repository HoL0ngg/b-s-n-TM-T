// src/pages/RegisterShop.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Import CSS
import './RegisterShop.css';

// Import các component con
import Stepper from '../components/Stepper';
import Step1ShopInfo from '../components/ShopSteps/Step1ShopInfo';
import Step2Shipping from '../components/ShopSteps/Step2Shipping';
// ...

const steps = [
  'Thông tin Shop',
  'Cài đặt vận chuyển',
  'Thông tin thuế',
  'Thông tin định danh',
  'Hoàn tất'
];

const RegisterShop = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // SỬA LỖI 1: Lấy toàn bộ context, không destructure
  const auth = useAuth();

  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    email: '',
    phone: '',
    shippingMethods: []
  });

  // Dùng useEffect để điền thông tin khi user đã được tải
  useEffect(() => {
    if (auth.user && auth.userProfile) {
      setFormData(prevData => ({
        ...prevData,

        email: auth.user?.email || '', // Lấy email từ `auth.user`

      }));
    }
  }, [auth.user, auth.userProfile]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1ShopInfo formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Shipping formData={formData} setFormData={setFormData} />;
      default:
        return <p>Đang tải bước...</p>;
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center mb-4">Đăng ký trở thành Người bán Shopee</h2>

          <div className="px-md-5 my-5">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          <div className="px-md-4">
            {renderStepContent()}
          </div>

          {/* ... (Các nút bấm giữ nguyên) ... */}
        </div>
      </div>
    </div>
  );
};

export default RegisterShop;