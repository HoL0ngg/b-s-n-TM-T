// src/components/ShopSteps/Step1ShopInfo.tsx
import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onEditAddress: () => void; // Nhận hàm mới từ cha
}

const Step1ShopInfo = ({ formData, setFormData, onEditAddress }: StepProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h4 className="mb-4">Thông tin Shop</h4>
      
      {/* Tên Shop (Giữ nguyên) */}
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
          />
        </div>
      </div>

      {/* Địa chỉ (SỬA LẠI THÀNH DẠNG NÚT BẤM) */}
      <div className="mb-3 row">
        <label htmlFor="address" className="col-sm-3 col-form-label text-end">
          * Địa chỉ lấy hàng
        </label>
        <div className="col-sm-8 d-flex align-items-center">
          {/* Hiển thị địa chỉ (chỉ đọc) */}
          <span className="me-3">
            {formData.address || 'Chưa có địa chỉ'}
          </span>
          
          {/* Nút bấm để mở modal (gọi hàm của cha) */}
          <button 
            type="button" 
            className="btn btn-outline-primary btn-sm"
            onClick={onEditAddress}
          >
            Thay đổi
          </button>
        </div>
      </div>
      
      {/* Email (Giữ nguyên - chỉ đọc) */}
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
        </div>
      </div>

      {/* Số điện thoại (Giữ nguyên - cho phép sửa) */}
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
            value={formData.phone} // Sẽ hiển thị user.id
            onChange={handleChange} // Cho phép sửa nếu muốn
          />
        </div>
      </div>
    </div>
  );
};

export default Step1ShopInfo;