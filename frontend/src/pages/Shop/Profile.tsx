import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getShopInfoByUserId, updateShopInfo } from '../../api/shopinfo';
import { apiUpdateShop, fetchShopByOwnerId } from '../../api/shop';
import type { ShopType } from '../../types/ShopType';

// Interface phù hợp với database structure
interface ShopInfo {
  // Từ bảng shop_info
  id: number;
  shop_id: number;
  user_id: number;
  address: string;
  email: string;
  phone: string;
  shipping_methods: string; // JSON string: ["GHN", "GHTK"]
  business_type: 'individual' | 'company' | 'personal';
  invoice_email: string;
  tax_code: string;
  identity_type: 'cmnd' | 'cccd' | 'passport';
  identity_number: string;
  identity_full_name: string;
  updated_at?: string;
  // Từ JOIN với bảng shops
  shop_name?: string;
  shop_logo_url?: string;
  shop_description?: string;
  shop_status?: number;
}

export default function ProfileShop() {
  const { user } = useAuth();
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [shopData, setShopData] = useState<ShopType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ShopInfo>>({});

  useEffect(() => {
    if (user?.id) {
      console.log('Fetching shop info for user:', user.id);
      fetchAllShopData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllShopData = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching shop data for userId:', user.id);

      // Lấy thông tin shop từ bảng shops
      const shop = await fetchShopByOwnerId(user.id);
      console.log('Shop data:', shop);
      setShopData(shop);

      // Lấy thông tin shop_info
      const infoResponse = await getShopInfoByUserId(user.id);
      console.log('Shop info data:', infoResponse);

      // FIX QUAN TRỌNG: bóc đúng phần chứa dữ liệu shop_info
      const info = infoResponse?.shop ?? infoResponse;

      if (info && shop) {
        const mergedData = {
          ...info,
          shop_name: shop.name,
          shop_logo_url: shop.logo_url,
          shop_description: shop.description,
          shop_status: shop.status,
        };

        setShopInfo(mergedData);
        setFormData(mergedData);
      } else {
        setShopInfo(null);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setShopInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShippingMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    try {
      let currentMethods: string[] = [];
      if (formData.shipping_methods) {
        try {
          currentMethods = JSON.parse(formData.shipping_methods);
        } catch {
          currentMethods = [];
        }
      }

      let newMethods: string[];
      if (checked) {
        newMethods = [...currentMethods, name];
      } else {
        newMethods = currentMethods.filter((method: string) => method !== name);
      }

      setFormData(prev => ({
        ...prev,
        shipping_methods: JSON.stringify(newMethods),
      }));
    } catch (error) {
      console.error('Error updating shipping methods:', error);
    }
  };

  const isShippingMethodChecked = (methodName: string): boolean => {
    try {
      if (!formData.shipping_methods) return false;
      const methods = JSON.parse(formData.shipping_methods);
      return Array.isArray(methods) && methods.includes(methodName);
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    console.log('🔍 Debug IDs:', {
      'shopInfo': shopInfo,
      'shopInfo.id': shopInfo?.id,
      'shopInfo.shop_id': shopInfo?.shop_id,
      'shopData': shopData,
      'shopData.id': shopData?.id
    });

    if (!shopInfo?.shop_id || !shopData?.id) {
      console.error('❌ Missing required IDs');
      showNotification('danger', 'Thiếu thông tin shop');
      return;
    }

    try {
      setSaving(true);

      // Bước 1: Cập nhật bảng shops
      const shopUpdateData = {
        name: formData.shop_name || shopData.name,
        logo_url: formData.shop_logo_url || shopData.logo_url,
        description: formData.shop_description || shopData.description,
        status: formData.shop_status ?? shopData.status,
      };

      console.log('📄 Step 1: Updating shops table');
      console.log('  - Shop ID:', shopData.id);
      console.log('  - Data:', shopUpdateData);
      
      await apiUpdateShop(shopData.id, shopUpdateData);
      console.log('✅ Shops table updated');

      // Bước 2: Cập nhật bảng shop_info
      const shopInfoUpdateData = {
        address: formData.address || '',
        email: formData.email || '',
        phone: formData.phone || '',
        shipping_methods: formData.shipping_methods || '[]',
        business_type: formData.business_type || 'individual',
        invoice_email: formData.invoice_email || '',
        tax_code: formData.tax_code || '',
        identity_type: formData.identity_type || 'cccd',
        identity_number: formData.identity_number || '',
        identity_full_name: formData.identity_full_name || '',
      };

      console.log('📄 Step 2: Updating shop_info table');
      console.log('  - Shop ID (FK):', shopInfo.shop_id);
      console.log('  - Data:', shopInfoUpdateData);
      
      await updateShopInfo(shopInfo.shop_id, shopInfoUpdateData);
      console.log('✅ Shop_info table updated');

      await fetchAllShopData();
      setIsEditing(false);

      showNotification('success', 'Cập nhật thông tin shop thành công! 🎉');
      
    } catch (error: any) {
      console.error('❌ Error updating shop:', error);
      console.error('Error response:', error?.response);
      
      showNotification(
        'danger',
        error?.response?.data?.message || 'Lỗi khi cập nhật thông tin shop'
      );
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type: string, message: string) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const handleCancel = () => {
    setFormData(shopInfo || {});
    setIsEditing(false);
  };

  const parseShippingMethods = (methods: string): string[] => {
    try {
      const parsed = JSON.parse(methods);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#F5F5F5' }}>
        <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh', padding: '24px' }}>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Vui lòng đăng nhập để xem thông tin shop.
        </div>
      </div>
    );
  }

  if (!shopInfo || !shopData) {
    return (
      <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh', padding: '24px' }}>
        <div className="alert alert-warning d-flex align-items-center">
          <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
          <div>
            <h5 className="alert-heading mb-1">Không tìm thấy thông tin shop</h5>
            <p className="mb-0">
              User ID: <strong>{user.id}</strong> - Bạn chưa đăng ký shop hoặc shop không tồn tại.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #B7CCFF 0%, #8FB0FF 100%)',
        padding: '24px 32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <i className="bi bi-shop" style={{ fontSize: '28px', color: '#FF9800' }}></i>
            </div>
            <div>
              <h1 className="mb-1" style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Thông tin Shop
              </h1>
              <p className="mb-0" style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {shopInfo.shop_name || 'Shop của bạn'} • Shop ID: {shopInfo.shop_id}
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn d-flex align-items-center gap-2"
                style={{
                  backgroundColor: '#fff',
                  color: '#FF9800',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-pencil"></i>
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Lưu
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#fff',
                    color: '#999',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="bi bi-x-circle"></i>
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px 32px' }}>
        <div className="row g-3">
          {/* Thông tin cơ bản Shop */}
          <div className="col-lg-6">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              height: '100%'
            }}>
              <div style={{
                backgroundColor: '#F5F5F5',
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '0' }}>
                  <i className="bi bi-shop me-2" style={{ color: '#2196F3' }}></i>
                  Thông tin cơ bản Shop
                </h5>
              </div>
              <div style={{ padding: '24px' }}>
                {/* Tên Shop */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="Nhập tên shop"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.shop_name || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Logo URL */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                    <i className="bi bi-image me-2"></i>
                    Logo URL
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      name="shop_logo_url"
                      value={formData.shop_logo_url || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <div>
                      <p style={{ fontSize: '14px', color: '#333', marginBottom: '12px', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                        {shopInfo.shop_logo_url || 'Chưa cập nhật'}
                      </p>
                      {shopInfo.shop_logo_url && (
                        <img
                          src={shopInfo.shop_logo_url}
                          alt="Shop Logo"
                          style={{
                            maxWidth: '150px',
                            maxHeight: '150px',
                            borderRadius: '8px',
                            border: '1px solid #E0E0E0'
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Mô tả Shop */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                    <i className="bi bi-file-text me-2"></i>
                    Mô tả Shop
                  </label>
                  {isEditing ? (
                    <textarea
                      className="form-control"
                      name="shop_description"
                      rows={3}
                      value={formData.shop_description || ''}
                      onChange={handleChange}
                      placeholder="Nhập mô tả về shop của bạn"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px', minHeight: '80px' }}>
                      {shopInfo.shop_description || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Trạng thái Shop */}
                <div className="mb-0">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                    <i className="bi bi-toggle-on me-2"></i>
                    Trạng thái Shop
                  </label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      name="shop_status"
                      value={formData.shop_status ?? 1}
                      onChange={handleChange}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    >
                      <option value={1}>Hoạt động</option>
                      <option value={0}>Tạm ngưng</option>
                    </select>
                  ) : (
                    <div style={{ padding: '10px 14px' }}>
                      {shopInfo.shop_status === 1 ? (
                        <span style={{
                          backgroundColor: '#E8F5E9',
                          color: '#4CAF50',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          Hoạt động
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#F5F5F5',
                          color: '#999',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          Tạm ngưng
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="col-lg-6">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              height: '100%'
            }}>
              <div style={{
                backgroundColor: '#F5F5F5',
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '0' }}>
                  <i className="bi bi-info-circle me-2" style={{ color: '#2196F3' }}></i>
                  Thông tin liên hệ
                </h5>
              </div>
              <div style={{ padding: '24px' }}>
                {/* Địa chỉ */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="Nhập địa chỉ shop"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px', minHeight: '80px' }}>
                      {shopInfo.address || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="email@example.com"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.email || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="mb-0">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="0912345678"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.phone || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin kinh doanh */}
          <div className="col-lg-6">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              height: '100%'
            }}>
              <div style={{
                backgroundColor: '#F5F5F5',
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '0' }}>
                  <i className="bi bi-briefcase me-2" style={{ color: '#FF9800' }}></i>
                  Thông tin kinh doanh
                </h5>
              </div>
              <div style={{ padding: '24px' }}>
                {/* Loại hình kinh doanh */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                    <i className="bi bi-building me-2"></i>
                    Loại hình kinh doanh
                  </label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      name="business_type"
                      value={formData.business_type || 'individual'}
                      onChange={handleChange}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    >
                      <option value="individual">Cá nhân</option>
                      <option value="company">Công ty</option>
                      <option value="personal">Hộ kinh doanh</option>
                    </select>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.business_type === 'individual'
                        ? 'Cá nhân'
                        : shopInfo.business_type === 'company'
                        ? 'Công ty'
                        : shopInfo.business_type === 'personal'
                        ? 'Hộ kinh doanh'
                        : 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Email nhận hóa đơn */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="invoice@example.com"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.invoice_email || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Mã số thuế */}
                <div className="mb-0">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="Nhập mã số thuế"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.tax_code || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin định danh */}
          <div className="col-lg-6">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              height: '100%'
            }}>
              <div style={{
                backgroundColor: '#F5F5F5',
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '0' }}>
                  <i className="bi bi-person-badge me-2" style={{ color: '#9C27B0' }}></i>
                  Thông tin định danh
                </h5>
              </div>
              <div style={{ padding: '24px' }}>
                {/* Loại giấy tờ */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                    <i className="bi bi-card-text me-2"></i>
                    Loại giấy tờ
                  </label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      name="identity_type"
                      value={formData.identity_type || 'cccd'}
                      onChange={handleChange}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    >
                      <option value="cmnd">CMND</option>
                      <option value="cccd">CCCD</option>
                      <option value="passport">Hộ chiếu</option>
                    </select>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.identity_type === 'cmnd'
                        ? 'CMND'
                        : shopInfo.identity_type === 'cccd'
                        ? 'CCCD'
                        : shopInfo.identity_type === 'passport'
                        ? 'Hộ chiếu'
                        : 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Số giấy tờ */}
                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="Nhập số CMND/CCCD/Passport"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.identity_number || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                {/* Họ và tên */}
                <div className="mb-0">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
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
                      placeholder="Nguyễn Văn A"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        padding: '10px 14px'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#333', marginBottom: '0', padding: '10px 14px', backgroundColor: '#F5F5F5', borderRadius: '8px' }}>
                      {shopInfo.identity_full_name || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phương thức vận chuyển */}
          <div className="col-12">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#F5F5F5',
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '0' }}>
                  <i className="bi bi-truck me-2" style={{ color: '#4CAF50' }}></i>
                  Phương thức vận chuyển
                </h5>
              </div>
              <div style={{ padding: '24px' }}>
                {isEditing ? (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '16px', display: 'block' }}>
                      <i className="bi bi-box-seam me-2"></i>
                      Các phương thức hỗ trợ
                    </label>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div style={{
                          backgroundColor: '#F5F5F5',
                          padding: '16px',
                          borderRadius: '8px',
                          border: isShippingMethodChecked('GHN') ? '2px solid #2196F3' : '2px solid transparent'
                        }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="ghn"
                              name="GHN"
                              checked={isShippingMethodChecked('GHN')}
                              onChange={handleShippingMethodChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor="ghn" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                              <i className="bi bi-truck me-2"></i>
                              Giao Hàng Nhanh (GHN)
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div style={{
                          backgroundColor: '#F5F5F5',
                          padding: '16px',
                          borderRadius: '8px',
                          border: isShippingMethodChecked('GHTK') ? '2px solid #2196F3' : '2px solid transparent'
                        }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="ghtk"
                              name="GHTK"
                              checked={isShippingMethodChecked('GHTK')}
                              onChange={handleShippingMethodChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor="ghtk" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                              <i className="bi bi-truck me-2"></i>
                              Giao Hàng Tiết Kiệm (GHTK)
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div style={{
                          backgroundColor: '#F5F5F5',
                          padding: '16px',
                          borderRadius: '8px',
                          border: isShippingMethodChecked('ViettelPost') ? '2px solid #2196F3' : '2px solid transparent'
                        }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="viettel"
                              name="ViettelPost"
                              checked={isShippingMethodChecked('ViettelPost')}
                              onChange={handleShippingMethodChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor="viettel" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                              <i className="bi bi-truck me-2"></i>
                              Viettel Post
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div style={{
                          backgroundColor: '#F5F5F5',
                          padding: '16px',
                          borderRadius: '8px',
                          border: isShippingMethodChecked('SPX') ? '2px solid #2196F3' : '2px solid transparent'
                        }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="spx"
                              name="SPX"
                              checked={isShippingMethodChecked('SPX')}
                              onChange={handleShippingMethodChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor="spx" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                              <i className="bi bi-truck me-2"></i>
                              SPX Express
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div style={{
                          backgroundColor: '#F5F5F5',
                          padding: '16px',
                          borderRadius: '8px',
                          border: isShippingMethodChecked('J&T') ? '2px solid #2196F3' : '2px solid transparent'
                        }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="jnt"
                              name="J&T"
                              checked={isShippingMethodChecked('J&T')}
                              onChange={handleShippingMethodChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor="jnt" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                              <i className="bi bi-truck me-2"></i>
                              J&T Express
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div style={{
                          backgroundColor: '#F5F5F5',
                          padding: '16px',
                          borderRadius: '8px',
                          border: isShippingMethodChecked('VNPost') ? '2px solid #2196F3' : '2px solid transparent'
                        }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="vnpost"
                              name="VNPost"
                              checked={isShippingMethodChecked('VNPost')}
                              onChange={handleShippingMethodChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor="vnpost" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                              <i className="bi bi-truck me-2"></i>
                              Vietnam Post (VNPost)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#E3F2FD',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <i className="bi bi-info-circle me-2" style={{ color: '#2196F3' }}></i>
                      <small style={{ color: '#2196F3', fontSize: '13px' }}>
                        Chọn các đơn vị vận chuyển mà shop của bạn hỗ trợ
                      </small>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '16px', display: 'block' }}>
                      <i className="bi bi-box-seam me-2"></i>
                      Các phương thức hỗ trợ
                    </label>
                    {(() => {
                      const methods = parseShippingMethods(shopInfo.shipping_methods);
                      if (methods.length === 0) {
                        return (
                          <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            backgroundColor: '#F5F5F5',
                            borderRadius: '8px'
                          }}>
                            <i className="bi bi-exclamation-circle" style={{ fontSize: '36px', color: '#999', marginBottom: '12px', display: 'block' }}></i>
                            <p style={{ color: '#999', fontSize: '14px', marginBottom: '0' }}>
                              Chưa có phương thức vận chuyển nào
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="d-flex flex-wrap gap-2">
                          {methods.map((method: string, index: number) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: '#E8F5E9',
                                color: '#4CAF50',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <i className="bi bi-check-circle-fill"></i>
                              {method}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}