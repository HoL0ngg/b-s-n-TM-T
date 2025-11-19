// src/components/ShopSteps/Step1ShopInfo.tsx
import React, { useState } from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onEditAddress: () => void;
}

const Step1ShopInfo = ({ formData, setFormData, onEditAddress }: StepProps) => {
  const [logoPreview, setLogoPreview] = useState<string>(formData.logoUrl || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setFormData({ ...formData, logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData({ ...formData, logoUrl: '' });
    // Reset input file
    const fileInput = document.getElementById('logoFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div>
      <h4 className="mb-4">Thông tin Shop</h4>
      
      {/* Tên Shop */}
      <div className="mb-3 row">
        <label htmlFor="shopName" className="col-sm-3 col-form-label text-end">
          * Tên Shop
        </label>
        <div className="col-sm-8">
          <input
            type="text"
            className="form-control"
            id="shopName"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            placeholder="Nhập tên shop của bạn"
          />
          <small className="text-muted">Tên shop sẽ hiển thị cho khách hàng</small>
        </div>
      </div>

      {/* Logo Shop */}
      <div className="mb-3 row">
        <label htmlFor="logoFile" className="col-sm-3 col-form-label text-end">
          Logo Shop
        </label>
        <div className="col-sm-8">
          <div className="d-flex align-items-start gap-3">
            {/* Preview logo */}
            <div className="border rounded p-2" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span className="text-muted small text-center">
                  Chưa có logo
                </span>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-grow-1">
              <input
                type="file"
                className="form-control mb-2"
                id="logoFile"
                accept="image/*"
                onChange={handleLogoChange}
              />
              <small className="text-muted d-block mb-2">
                Định dạng: JPG, PNG, WEBP. Kích thước tối đa: 5MB
              </small>
              {logoPreview && (
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm"
                  onClick={removeLogo}
                >
                  Xóa logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mô tả Shop */}
      <div className="mb-3 row">
        <label htmlFor="description" className="col-sm-3 col-form-label text-end">
          Mô tả
        </label>
        <div className="col-sm-8">
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Giới thiệu về shop của bạn..."
            maxLength={500}
          />
          <small className="text-muted">
            {formData.description?.length || 0}/500 ký tự
          </small>
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="mb-3 row">
        <label htmlFor="address" className="col-sm-3 col-form-label text-end">
          * Địa chỉ lấy hàng
        </label>
        <div className="col-sm-8 d-flex align-items-center">
          <span className="me-3 flex-grow-1">
            {formData.address || 'Chưa có địa chỉ'}
          </span>
          
          <button 
            type="button" 
            className="btn btn-outline-primary btn-sm"
            onClick={onEditAddress}
          >
            Thay đổi
          </button>
        </div>
      </div>
      
      {/* Email */}
      <div className="mb-3 row">
        <label htmlFor="email" className="col-sm-3 col-form-label text-end">
          * Email
        </label>
        <div className="col-sm-8">
          <input
            type="email"
            className="form-control-plaintext"
            id="email"
            name="email"
            value={formData.email}
            readOnly
          />
          <small className="text-muted">Email được lấy từ tài khoản của bạn</small>
        </div>
      </div>

      {/* Số điện thoại */}
      <div className="mb-3 row">
        <label htmlFor="phone" className="col-sm-3 col-form-label text-end">
          * Số điện thoại
        </label>
        <div className="col-sm-8">
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại liên hệ"
          />
          <small className="text-muted">Số điện thoại để khách hàng liên hệ</small>
        </div>
      </div>
    </div>
  );
};

export default Step1ShopInfo;