// src/components/ShopSteps/Step1ShopInfo.tsx
import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step1ShopInfo = ({ formData, setFormData }: StepProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          />
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="mb-3 row">
        <label htmlFor="address" className="col-sm-3 col-form-label text-end">
          * Địa chỉ lấy hàng
        </label>
        <div className="col-sm-8">
          <input
            type="text"
            className="form-control"
            id="address"
            name="address"
            placeholder="+ Thêm"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {/* Email (Lấy từ context, chỉ đọc) */}
      <div className="mb-3 row">
        <label htmlFor="email" className="col-sm-3 col-form-label text-end">
          * Email
        </label>
        <div className="col-sm-8">
          <input
            type="email"
            className="form-control-plaintext" // Dùng plaintext để chỉ đọc
            id="email"
            name="email"
            value={formData.email}
            readOnly
          />
        </div>
      </div>

      {/* Số điện thoại (Lấy từ context, có thể sửa) */}
      <div className="mb-3 row">
        <label htmlFor="phone" className="col-sm-3 col-form-label text-end">
          * Số điện thoại
        </label>
        <div className="col-sm-8">
          <input
            type="tel"
            className="form-control" // Cho phép sửa
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1ShopInfo;