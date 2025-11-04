// src/components/ShopSteps/Step4Identity.tsx
import React, { useState } from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step4Identity = ({ formData, setFormData }: StepProps) => {
  // State để lưu trữ lỗi
  const [errors, setErrors] = useState({
    identityNumber: '',
    identityFullName: '',
  });

  // --- HÀM KIỂM TRA LỖI (VALIDATE) ---
  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    
    if (name === 'identityNumber') {
      if (!value) {
        errorMsg = 'Số định danh là bắt buộc.';
      } else if (formData.identityType === 'cccd' && value.length !== 12) {
        errorMsg = 'Số CCCD phải có đúng 12 chữ số.';
      } else if (formData.identityType === 'cmnd' && value.length !== 9) {
        errorMsg = 'Số CMND phải có đúng 9 chữ số.';
      } else if (!/^\d+$/.test(value)) {
        errorMsg = 'Chỉ được phép nhập số.';
      }
    }

    if (name === 'identityFullName') {
      if (!value) {
        errorMsg = 'Họ & Tên là bắt buộc.';
      }
    }

    // Cập nhật state lỗi
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  // Xử lý input text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Xóa lỗi khi người dùng bắt đầu gõ
    // if (errors[name]) {
    //   setErrors(prev => ({ ...prev, [name]: '' }));
    // }
  };

  // Validate khi người dùng rời khỏi ô input (onBlur)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Xử lý radio
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, identityType: value });
    
    // Validate lại ô 'identityNumber' ngay lập tức
    if (formData.identityNumber) {
      validateField('identityNumber', formData.identityNumber);
    }
  };

  // Thay đổi label dựa trên lựa chọn
  let idNumberLabel = "Số Căn Cước Công Dân (CCCD)";
  if (formData.identityType === 'cmnd') {
    idNumberLabel = "Số Chứng Minh Nhân Dân (CMND)";
  } else if (formData.identityType === 'passport') {
    idNumberLabel = "Số Hộ chiếu";
  }

  return (
    <div>
      <h4 className="mb-4">Thông tin định danh</h4>

      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle-fill me-2"></i>
        Vui lòng cung cấp Thông Tin Định Danh của Chủ Shop (nếu là cá nhân), hoặc Người Đại Diện...
      </div>

      {/* 1. Loại hình định danh (Radio) */}
      <div className="mb-3 row">
        <label className="col-sm-3 col-form-label text-end">
          * Hình Thức Định Danh
        </label>
        <div className="col-sm-9 d-flex align-items-center gap-4">
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="identityType" 
              id="typeCccd" 
              value="cccd"
              checked={formData.identityType === 'cccd'}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="typeCccd">
              Căn Cước Công Dân (CCCD)
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="identityType" 
              id="typeCmnd" 
              value="cmnd"
              checked={formData.identityType === 'cmnd'}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="typeCmnd">
              Chứng Minh Nhân Dân (CMND)
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="identityType" 
              id="typePassport" 
              value="passport"
              checked={formData.identityType === 'passport'}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="typePassport">
              Hộ chiếu
            </label>
          </div>
        </div>
      </div>

      {/* 2. Số CCCD/CMND/Hộ chiếu (Đã thêm validate) */}
      <div className="mb-3 row">
        <label htmlFor="identityNumber" className="col-sm-3 col-form-label text-end">
          * {idNumberLabel}
        </label>
        <div className="col-sm-8">
          <input
            type="text"
            // Thêm class 'is-invalid' của Bootstrap nếu có lỗi
            className={`form-control ${errors.identityNumber ? 'is-invalid' : ''}`}
            id="identityNumber"
            name="identityNumber"
            placeholder="Nhập vào"
            value={formData.identityNumber}
            onChange={handleChange}
            onBlur={handleBlur} // Validate khi rời khỏi
            maxLength={formData.identityType === 'passport' ? undefined : 12}
          />
          {/* Hiển thị lỗi */}
          {errors.identityNumber && (
            <div className="invalid-feedback d-block">
              {errors.identityNumber}
            </div>
          )}
        </div>
      </div>

      {/* 3. Họ & Tên (Đã thêm validate) */}
      <div className="mb-3 row">
        <label htmlFor="identityFullName" className="col-sm-3 col-form-label text-end">
          * Họ & Tên
        </label>
        <div className="col-sm-8">
          <input
            type="text"
            className={`form-control ${errors.identityFullName ? 'is-invalid' : ''}`}
            id="identityFullName"
            name="identityFullName"
            placeholder="Theo CMND/CCCD/Hộ Chiếu"
            value={formData.identityFullName}
            onChange={handleChange}
            onBlur={handleBlur} // Validate khi rời khỏi
          />
          {/* Hiển thị lỗi */}
          {errors.identityFullName && (
            <div className="invalid-feedback d-block">
              {errors.identityFullName}
            </div>
          )}
        </div>
      </div>
      
      {/* (Phần tải ảnh đã được xóa) */}

    </div>
  );
};

export default Step4Identity;