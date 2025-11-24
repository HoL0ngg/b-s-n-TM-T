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

import { apiCreateShop } from '../api/shop';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    description: '',
    logoUrl: '',
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

  const handleAddressSelect = (selectedAddress: string) => {
    setFormData(prev => ({
      ...prev,
      address: selectedAddress
    }));
    setIsModalOpen(false);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.logoUrl.trim()) {
  newErrors.logoUrl = 'Vui lòng tải lên logo shop';
}
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Vui lòng nhập tên shop';
    } else if (formData.shopName.length < 3) {
      newErrors.shopName = 'Tên shop phải có ít nhất 3 ký tự';
    } else if (formData.shopName.length > 100) {
      newErrors.shopName = 'Tên shop không được vượt quá 100 ký tự';
    }
    if (!formData.description.trim()) {
  newErrors.description = 'Vui lòng nhập mô tả shop';
}


    // Validation cho logo (optional nhưng nếu có thì phải hợp lệ)
    if (formData.logoUrl && formData.logoUrl.trim()) {
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
      const urlRegex = /^(https?:\/\/|\/)/;
      
      if (!base64Regex.test(formData.logoUrl) && !urlRegex.test(formData.logoUrl)) {
        newErrors.logoUrl = 'Logo không hợp lệ';
      }
    }

    // Validation cho description (optional nhưng nếu có thì có giới hạn)
    if (formData.description && formData.description.trim()) {
      if (formData.description.length > 500) {
        newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
      }
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

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shippingMethods || formData.shippingMethods.length === 0) {
      newErrors.shippingMethods = 'Vui lòng chọn ít nhất một phương thức vận chuyển';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.businessType === 'business') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
        // Email hóa đơn bắt buộc
    if (!formData.invoiceEmail.trim()) {
      newErrors.invoiceEmail = 'Vui lòng nhập email nhận hóa đơn';
    } else if (!emailRegex.test(formData.invoiceEmail)) {
      newErrors.invoiceEmail = 'Email không hợp lệ';
    }

    // Mã số thuế bắt buộc
    if (!formData.taxCode.trim()) {
      newErrors.taxCode = 'Vui lòng nhập mã số thuế';
    } else {
      const cleanTaxCode = formData.taxCode.replace(/[-\s]/g, '');
      const taxCodeRegex = /^[0-9]{10}([0-9]{3})?$/;
      if (!taxCodeRegex.test(cleanTaxCode)) {
        newErrors.taxCode = 'Mã số thuế phải có 10 hoặc 13 chữ số';
      }
    }

    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    // Validate tất cả các bước
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();
    const isStep4Valid = validateStep4();

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) {
      alert("Vui lòng kiểm tra lại thông tin các bước trước đó!");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🚀 Bắt đầu đăng ký shop...");
      
      // Bước 1: Tạo shop trong bảng `shops`
      const shopPayload = {
        name: formData.shopName,
        logo_url: formData.logoUrl || '/assets/shops/default-shop.png',
        description: formData.description || `Shop chuyên về ${formData.shopName}`,
        status: 1,
        owner_id: auth.user.id
      };

      console.log("📦 Payload tạo shop:", shopPayload);
      const shopId = await apiCreateShop(shopPayload);
      console.log("✅ Shop đã tạo với ID:", shopId);

      if (!shopId) {
        throw new Error("Không thể tạo shop - Backend không trả về shopId");
      }

      // Bước 2: Tạo thông tin chi tiết trong bảng `shop_info`
      // Clean tax code trước khi gửi (loại bỏ dấu gạch ngang và khoảng trắng)
      const cleanTaxCode = formData.taxCode.trim() 
        ? formData.taxCode.replace(/[-\s]/g, '') 
        : '';

      const shopInfoPayload = {
        shop_id: shopId,
        user_id: auth.user.id,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        shipping_methods: JSON.stringify(formData.shippingMethods),
        business_type: formData.businessType,
        invoice_email: formData.invoiceEmail.trim() || null,
        tax_code: cleanTaxCode || null,
        identity_type: formData.identityType,
        identity_number: formData.identityNumber,
        identity_full_name: formData.identityFullName,
      };

      console.log("📦 Payload tạo shop info:", shopInfoPayload);
      await createShopInfo(shopInfoPayload);
      console.log("✅ Shop info đã tạo thành công");

      alert("Đăng ký shop thành công!");
      navigate('/seller');
    } catch (error: any) {
      console.error("❌ Lỗi chi tiết:", error);
      
      let errorMessage = "Đăng ký thất bại";
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Lỗi kết nối! Vui lòng kiểm tra:\n- Backend có đang chạy không?\n- URL API có đúng không?\n- CORS đã được cấu hình chưa?";
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
        console.error("📡 Response lỗi:", error.response.data);
      } else if (error.request) {
        errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra backend!";
      } else {
        errorMessage = error.message || "Đã xảy ra lỗi không xác định";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
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
            {errors.logoUrl && <div className="text-danger small mt-2">{errors.logoUrl}</div>}
            {errors.description && <div className="text-danger small mt-2">{errors.description}</div>}
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
        return (
          <div className="text-center py-4">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '64px' }}></i>
            </div>
            <h4 className="mb-3">Xác nhận thông tin</h4>
            <div className="text-start" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="mb-3">
                <strong>Tên shop:</strong> {formData.shopName}
              </div>
              <div className="mb-3">
                <strong>Địa chỉ:</strong> {formData.address}
              </div>
              <div className="mb-3">
                <strong>Loại hình:</strong> {formData.businessType === 'business' ? 'Doanh nghiệp' : 'Cá nhân'}
              </div>
              {formData.businessType === 'business' && (
                <>
                  <div className="mb-3">
                    <strong>Mã số thuế:</strong> {formData.taxCode}
                  </div>
                  <div className="mb-3">
                    <strong>Email hóa đơn:</strong> {formData.invoiceEmail}
                  </div>
                </>
              )}
              <div className="mb-3">
                <strong>Giấy tờ định danh:</strong> {formData.identityType.toUpperCase()} - {formData.identityNumber}
              </div>
            </div>
          </div>
        );
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
              <button className="btn btn-outline-secondary" onClick={prevStep} disabled={isSubmitting}>
                Quay lại
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < steps.length && (
              <button className="btn btn-primary" onClick={nextStep} disabled={isSubmitting}>
                Tiếp theo
              </button>
            )}

            {currentStep === steps.length && (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterShop;