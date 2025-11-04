// src/components/ShopSteps/Step3TaxInfo.tsx
import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step3TaxInfo = ({ formData, setFormData }: StepProps) => {
  
  // Hàm xử lý chung cho input (text, email)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý riêng cho radio button
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, businessType: e.target.value });
  };

  return (
    <div>
      <h4 className="mb-4">Thông tin thuế</h4>
      
      {/* 1. Loại hình kinh doanh */}
      <div className="mb-3 row">
        <label className="col-sm-3 col-form-label text-end">
          * Loại hình kinh doanh
        </label>
        <div className="col-sm-8 d-flex align-items-center gap-4">
          
          {/* Cá nhân */}
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="businessType" 
              id="typePersonal" 
              value="personal"
              checked={formData.businessType === 'personal'}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="typePersonal">
              Cá nhân
            </label>
          </div>
          
          {/* Hộ kinh doanh */}
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="businessType" 
              id="typeHousehold" 
              value="household"
              checked={formData.businessType === 'household'}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="typeHousehold">
              Hộ kinh doanh
            </label>
          </div>
          
          {/* Công ty */}
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="radio" 
              name="businessType" 
              id="typeCompany" 
              value="company"
              checked={formData.businessType === 'company'}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="typeCompany">
              Công ty
            </label>
          </div>
        </div>
      </div>

      {/* 2. Email nhận hóa đơn điện tử */}
      <div className="mb-3 row">
        <label htmlFor="invoiceEmail" className="col-sm-3 col-form-label text-end">
          * Email nhận hóa đơn
        </label>
        <div className="col-sm-8">
          <input
            type="email"
            className="form-control"
            id="invoiceEmail"
            name="invoiceEmail"
            value={formData.invoiceEmail}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 3. Mã số thuế */}
      <div className="mb-3 row">
        <label htmlFor="taxCode" className="col-sm-3 col-form-label text-end">
          Mã số thuế
        </label>
        <div className="col-sm-8">
          <input
            type="text"
            className="form-control"
            id="taxCode"
            name="taxCode"
            placeholder="Nhập vào"
            value={formData.taxCode}
            onChange={handleChange}
          />
        </div>
      </div>

    </div>
  );
};

export default Step3TaxInfo;