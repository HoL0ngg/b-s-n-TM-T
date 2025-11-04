import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface ShopInfo {
  id: number;
  user_id: string;
  shop_name: string;
  address: string;
  email: string;
  phone: string;
  shipping_methods: string;
  business_type: string;
  invoice_email: string;
  tax_code: string;
  identity_type: string;
  identity_number: string;
  identity_full_name: string;
}

export default function ProfileShop() {
  const { user } = useAuth(); // Lấy user từ AuthContext
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ShopInfo>>({});

  useEffect(() => {
    if (user?.id) {
      console.log('Fetching shop info for user:', user.id);
      fetchShopInfo();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShopInfo = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching shop for userId:', user.id);
      
      const response = await axios.get(`http://localhost:5000/api/shop_info/user/${user.id}`);
      console.log('Shop info response:', response.data);
      
      if (response.data) {
        setShopInfo(response.data);
        setFormData(response.data);
      } else {
        setShopInfo(null);
      }
    } catch (error: any) {
      console.error('Error fetching shop info:', error);
      if (error.response?.status === 404) {
        console.log('Shop not found for this user');
      }
      setShopInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || null // Convert empty string to null
    }));
  };

  const handleShippingMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    try {
      // Parse current shipping methods
      let currentMethods: string[] = [];
      if (formData.shipping_methods) {
        currentMethods = typeof formData.shipping_methods === 'string' 
          ? JSON.parse(formData.shipping_methods)
          : formData.shipping_methods;
      }

      // Update methods array
      let newMethods: string[];
      if (checked) {
        newMethods = [...currentMethods, name];
      } else {
        newMethods = currentMethods.filter((method: string) => method !== name);
      }

      // Update form data
      setFormData(prev => ({
        ...prev,
        shipping_methods: JSON.stringify(newMethods)
      }));
    } catch (error) {
      console.error('Error updating shipping methods:', error);
    }
  };

  const isShippingMethodChecked = (methodName: string): boolean => {
    try {
      if (!formData.shipping_methods) return false;
      
      const methods = typeof formData.shipping_methods === 'string'
        ? JSON.parse(formData.shipping_methods)
        : formData.shipping_methods;
      
      return Array.isArray(methods) && methods.includes(methodName);
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Clean data - loại bỏ undefined và empty strings
      const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Saving shop data:', cleanData);
      
      await axios.put(
        `http://localhost:5000/api/shop_info/update/${shopInfo?.id}`,
        cleanData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh shop info after update
      await fetchShopInfo();
      setIsEditing(false);
      
      // Success notification
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
      alertDiv.style.zIndex = '9999';
      alertDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Cập nhật thông tin shop thành công!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 3000);
      
    } catch (error: any) {
      console.error('Error updating shop info:', error);
      
      // Error notification
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
      alertDiv.style.zIndex = '9999';
      alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${error.response?.data?.message || 'Lỗi khi cập nhật thông tin shop'}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(shopInfo || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Vui lòng đăng nhập để xem thông tin shop.
      </div>
    );
  }

  if (!shopInfo) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning d-flex align-items-center">
          <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
          <div>
            <h5 className="alert-heading mb-1">Không tìm thấy thông tin shop</h5>
            <p className="mb-0">User ID: <strong>{user.id}</strong> - Bạn chưa đăng ký shop hoặc shop không tồn tại.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-shop me-2 text-primary"></i>
                Thông tin Shop
              </h2>
              <p className="text-muted mb-0">Quản lý thông tin cửa hàng của bạn</p>
            </div>
            {!isEditing ? (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil me-2"></i>
                Chỉnh sửa
              </button>
            ) : (
              <div className="btn-group">
                <button 
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Lưu
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Thông tin cơ bản */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Thông tin cơ bản
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-shop me-2"></i>
                  Tên Shop
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="shop_name"
                    value={formData.shop_name || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.shop_name}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-geo-alt me-2"></i>
                  Địa chỉ
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    name="address"
                    rows={3}
                    value={formData.address || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.address}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.email}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-telephone me-2"></i>
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin kinh doanh */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-briefcase me-2 text-primary"></i>
                Thông tin kinh doanh
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-building me-2"></i>
                  Loại hình kinh doanh
                </label>
                {isEditing ? (
                  <select
                    className="form-select"
                    name="business_type"
                    value={formData.business_type || ''}
                    onChange={handleChange}
                  >
                    <option value="individual">Cá nhân</option>
                    <option value="company">Công ty</option>
                    <option value="household">Hộ kinh doanh</option>
                  </select>
                ) : (
                  <p className="form-control-plaintext">
                    {shopInfo.business_type === 'individual' ? 'Cá nhân' : 
                     shopInfo.business_type === 'company' ? 'Công ty' : 'Hộ kinh doanh'}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-receipt me-2"></i>
                  Email nhận hóa đơn
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="form-control"
                    name="invoice_email"
                    value={formData.invoice_email || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.invoice_email}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-hash me-2"></i>
                  Mã số thuế
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="tax_code"
                    value={formData.tax_code || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.tax_code || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin định danh */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                Thông tin định danh
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-card-text me-2"></i>
                  Loại giấy tờ
                </label>
                {isEditing ? (
                  <select
                    className="form-select"
                    name="identity_type"
                    value={formData.identity_type || ''}
                    onChange={handleChange}
                  >
                    <option value="cmnd">CMND</option>
                    <option value="cccd">CCCD</option>
                    <option value="passport">Hộ chiếu</option>
                  </select>
                ) : (
                  <p className="form-control-plaintext">
                    {shopInfo.identity_type === 'cmnd' ? 'CMND' : 
                     shopInfo.identity_type === 'cccd' ? 'CCCD' : 'Hộ chiếu'}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-123 me-2"></i>
                  Số giấy tờ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="identity_number"
                    value={formData.identity_number || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.identity_number}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-person me-2"></i>
                  Họ và tên (trên giấy tờ)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="identity_full_name"
                    value={formData.identity_full_name || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="form-control-plaintext">{shopInfo.identity_full_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phương thức vận chuyển */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-truck me-2 text-primary"></i>
                Phương thức vận chuyển
              </h5>
            </div>
            <div className="card-body">
              {isEditing ? (
                <div>
                  <label className="form-label fw-bold mb-3">
                    <i className="bi bi-box-seam me-2"></i>
                    Các phương thức hỗ trợ
                  </label>
                  
                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="ghn"
                      name="GHN"
                      checked={isShippingMethodChecked('GHN')}
                      onChange={handleShippingMethodChange}
                    />
                    <label className="form-check-label" htmlFor="ghn">
                      <i className="bi bi-truck me-2"></i>
                      Giao Hàng Nhanh (GHN)
                    </label>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="ghtk"
                      name="GHTK"
                      checked={isShippingMethodChecked('GHTK')}
                      onChange={handleShippingMethodChange}
                    />
                    <label className="form-check-label" htmlFor="ghtk">
                      <i className="bi bi-truck me-2"></i>
                      Giao Hàng Tiết Kiệm (GHTK)
                    </label>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="viettel"
                      name="ViettelPost"
                      checked={isShippingMethodChecked('ViettelPost')}
                      onChange={handleShippingMethodChange}
                    />
                    <label className="form-check-label" htmlFor="viettel">
                      <i className="bi bi-truck me-2"></i>
                      Viettel Post
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="spx"
                      name="SPX"
                      checked={isShippingMethodChecked('SPX')}
                      onChange={handleShippingMethodChange}
                    />
                    <label className="form-check-label" htmlFor="spx">
                      <i className="bi bi-truck me-2"></i>
                      SPX Express
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="jnt"
                      name="J&T"
                      checked={isShippingMethodChecked('J&T')}
                      onChange={handleShippingMethodChange}
                    />
                    <label className="form-check-label" htmlFor="jnt">
                      <i className="bi bi-truck me-2"></i>
                      J&T Express
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="vnpost"
                      name="VNPost"
                      checked={isShippingMethodChecked('VNPost')}
                      onChange={handleShippingMethodChange}
                    />
                    <label className="form-check-label" htmlFor="vnpost">
                      <i className="bi bi-truck me-2"></i>
                      Vietnam Post (VNPost)
                    </label>
                  </div>

                  <div className="alert alert-info mt-3 mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>Chọn các đơn vị vận chuyển mà shop của bạn hỗ trợ</small>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="form-label fw-bold mb-3">
                    <i className="bi bi-box-seam me-2"></i>
                    Các phương thức hỗ trợ
                  </label>
                  {(() => {
                    try {
                      const methods = JSON.parse(shopInfo.shipping_methods);
                      if (!methods || methods.length === 0) {
                        return (
                          <p className="text-muted">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            Chưa có phương thức vận chuyển nào
                          </p>
                        );
                      }
                      return (
                        <div className="d-flex flex-wrap gap-2">
                          {methods.map((method: string, index: number) => (
                            <span key={index} className="badge bg-primary fs-6 py-2 px-3">
                              <i className="bi bi-check-circle me-1"></i>
                              {method}
                            </span>
                          ))}
                        </div>
                      );
                    } catch {
                      return (
                        <p className="text-muted">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          Chưa cập nhật
                        </p>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}