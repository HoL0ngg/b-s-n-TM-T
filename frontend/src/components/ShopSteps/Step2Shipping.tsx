// src/components/ShopSteps/Step2Shipping.tsx
import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step2Shipping = ({ formData, setFormData }: StepProps) => {
  // Logic xử lý check/uncheck
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    let newMethods = [...formData.shippingMethods];
    
    if (checked) {
      newMethods.push(name);
    } else {
      newMethods = newMethods.filter(method => method !== name);
    }
    
    setFormData({ ...formData, shippingMethods: newMethods });
  };

  return (
    <div>
      <h4 className="mb-4">Cài đặt vận chuyển</h4>
      <p>Chọn các đơn vị vận chuyển bạn muốn kích hoạt:</p>
      
      <div className="form-check form-switch mb-2">
        <input 
          className="form-check-input" 
          type="checkbox" 
          id="ghn"
          name="GHN"
          checked={formData.shippingMethods.includes('GHN')}
          onChange={handleCheckboxChange}
        />
        <label className="form-check-label" htmlFor="ghn">
          Giao Hàng Nhanh
        </label>
      </div>

      <div className="form-check form-switch mb-2">
        <input 
          className="form-check-input" 
          type="checkbox" 
          id="ghtk"
          name="GHTK"
          checked={formData.shippingMethods.includes('GHTK')}
          onChange={handleCheckboxChange}
        />
        <label className="form-check-label" htmlFor="ghtk">
          Giao Hàng Tiết Kiệm
        </label>
      </div>

      <div className="form-check form-switch mb-2">
        <input 
          className="form-check-input" 
          type="checkbox" 
          id="viettel"
          name="ViettelPost"
          checked={formData.shippingMethods.includes('ViettelPost')}
          onChange={handleCheckboxChange}
        />
        <label className="form-check-label" htmlFor="viettel">
          Viettel Post
        </label>
      </div>
    </div>
  );
};

export default Step2Shipping;