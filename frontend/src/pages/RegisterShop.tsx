import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAddressByUserId } from '../api/user'; 
import type { AddressType } from '../types/UserType'; 

import './RegisterShop.css'; 

import Stepper from '../components/Stepper';
import Step1ShopInfo from '../components/ShopSteps/Step1ShopInfo';
import Step2Shipping from '../components/ShopSteps/Step2Shipping';
import Step3TaxInfo from '../components/ShopSteps/Step3TaxInfo';
import Step4Identity from '../components/ShopSteps/Step4Identity';
import ShopAddressModal from '../components/ShopAddressModal';

import { createShopInfo } from '../api/shopinfo';

const steps = [
  'Thông tin Shop',
  'Cài đặt vận chuyển',
  'Thông tin thuế',
  'Thông tin định danh',
  'Hoàn tất'
];

const formatAddress = (addr: AddressType) => {
  return `${addr.home_number} ${addr.street}, ${addr.ward}, ${addr.city}`;
};

const RegisterShop = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const auth = useAuth(); 

  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    email: '',
    phone: '',
    shippingMethods: [],
    businessType: 'personal',
    invoiceEmail: '',
    taxCode: '',
    identityType: 'cccd',
    identityNumber: '',
    identityFullName: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const loadAddresses = async () => {
    if (auth.user) {
      try {
        const data = await fetchAddressByUserId(auth.user.id.toString());
        
        if (data && data.length > 0) {
          const defaultAddress = data.find(addr => addr.is_default === 1);
          const addressToSet = defaultAddress || data[0];
          setFormData(prev => ({ 
            ...prev, 
            address: formatAddress(addressToSet) 
          }));
        }
      } catch (error) {
        console.error("Lỗi khi tải địa chỉ:", error);
      }
    }
  };

  useEffect(() => {
    if (auth.user) {
      setFormData(prevData => ({
        ...prevData,
        email: auth.user?.email || '',
        phone: auth.user?.id.toString() || ''
      }));
      loadAddresses();
    }
  }, [auth.user]);

  // Hàm xử lý khi user chọn địa chỉ từ modal
  const handleAddressSelect = (selectedAddress: string) => {
    setFormData(prev => ({ 
      ...prev, 
      address: selectedAddress 
    }));
    setIsModalOpen(false);
  };

  // Validation cho Step 1
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Vui lòng nhập tên shop';
    } else if (formData.shopName.length < 3) {
      newErrors.shopName = 'Tên shop phải có ít nhất 3 ký tự';
    } else if (formData.shopName.length > 100) {
      newErrors.shopName = 'Tên shop không được vượt quá 100 ký tự';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng chọn địa chỉ shop';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation cho Step 2
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.shippingMethods || formData.shippingMethods.length === 0) {
      newErrors.shippingMethods = 'Vui lòng chọn ít nhất một phương thức vận chuyển';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation cho Step 3
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.businessType === 'business') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.invoiceEmail.trim()) {
        newErrors.invoiceEmail = 'Vui lòng nhập email nhận hóa đơn';
      } else if (!emailRegex.test(formData.invoiceEmail)) {
        newErrors.invoiceEmail = 'Email không hợp lệ';
      }

      const taxCodeRegex = /^[0-9]{10}(-[0-9]{3})?$/;
      if (!formData.taxCode.trim()) {
        newErrors.taxCode = 'Vui lòng nhập mã số thuế';
      } else if (!taxCodeRegex.test(formData.taxCode)) {
        newErrors.taxCode = 'Mã số thuế phải có 10 chữ số hoặc 10 chữ số + 3 chữ số chi nhánh (VD: 0123456789 hoặc 0123456789-001)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation cho Step 4
  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.identityFullName.trim()) {
      newErrors.identityFullName = 'Vui lòng nhập họ và tên';
    } else if (formData.identityFullName.length < 3) {
      newErrors.identityFullName = 'Họ và tên phải có ít nhất 3 ký tự';
    }

    if (!formData.identityNumber.trim()) {
      newErrors.identityNumber = 'Vui lòng nhập số giấy tờ';
    } else {
      if (formData.identityType === 'cccd') {
        const cccdRegex = /^[0-9]{12}$/;
        if (!cccdRegex.test(formData.identityNumber)) {
          newErrors.identityNumber = 'Số CCCD phải có 12 chữ số';
        }
      } else if (formData.identityType === 'cmnd') {
        const cmndRegex = /^[0-9]{9}$/;
        if (!cmndRegex.test(formData.identityNumber)) {
          newErrors.identityNumber = 'Số CMND phải có 9 chữ số';
        }
      } else if (formData.identityType === 'passport') {
        const passportRegex = /^[A-Z0-9]{6,9}$/;
        if (!passportRegex.test(formData.identityNumber.toUpperCase())) {
          newErrors.identityNumber = 'Số hộ chiếu không hợp lệ (6-9 ký tự chữ và số)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = true;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!auth.user) {
      alert("Lỗi: Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();
    const isStep4Valid = validateStep4();

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) {
      alert("Vui lòng kiểm tra lại thông tin các bước trước đó!");
      setCurrentStep(1);
      return;
    }

    try {
      const response = await createShopInfo(formData);
      alert("Đăng ký shop thành công!");
      navigate('/seller');
    } catch (error: any) {
      console.error("Lỗi khi đăng ký shop:", error);
      alert(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Step1ShopInfo 
              formData={formData} 
              setFormData={setFormData}
              onEditAddress={() => setIsModalOpen(true)}
            />
            {errors.shopName && <div className="text-danger small mt-2">{errors.shopName}</div>}
            {errors.address && <div className="text-danger small mt-2">{errors.address}</div>}
            {errors.email && <div className="text-danger small mt-2">{errors.email}</div>}
            {errors.phone && <div className="text-danger small mt-2">{errors.phone}</div>}
          </>
        );
      case 2:
        return (
          <>
            <Step2Shipping 
              formData={formData} 
              setFormData={setFormData}
            />
            {errors.shippingMethods && <div className="text-danger small mt-2">{errors.shippingMethods}</div>}
          </>
        );
      case 3:
        return (
          <>
            <Step3TaxInfo 
              formData={formData} 
              setFormData={setFormData}
            />
            {errors.invoiceEmail && <div className="text-danger small mt-2">{errors.invoiceEmail}</div>}
            {errors.taxCode && <div className="text-danger small mt-2">{errors.taxCode}</div>}
          </>
        );
      case 4:
        return (
          <>
            <Step4Identity 
              formData={formData} 
              setFormData={setFormData}
            />
            {errors.identityFullName && <div className="text-danger small mt-2">{errors.identityFullName}</div>}
            {errors.identityNumber && <div className="text-danger small mt-2">{errors.identityNumber}</div>}
          </>
        );
      case 5:
        return <p>Xác nhận và Hoàn tất...</p>;
      default:
        return <p>Bước {currentStep}...</p>;
    }
  };

  return (
    <div className="container my-5">
      <ShopAddressModal 
        isShow={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddressSelect={handleAddressSelect}
      />

      <div className="card shadow-sm" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center mb-4">Đăng ký trở thành Người bán</h2>
          
          <div className="px-md-5 my-5">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          <div className="px-md-4">
            {renderStepContent()}
          </div>
          
          <div className="d-flex justify-content-between mt-5">
            {currentStep > 1 ? (
              <button className="btn btn-outline-secondary" onClick={prevStep}>
                Quay lại
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < steps.length && (
              <button className="btn btn-primary" onClick={nextStep}>
                Tiếp theo
              </button>
            )}

            {currentStep === steps.length && (
              <button className="btn btn-primary" onClick={handleSubmit}>
                Hoàn tất
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterShop;