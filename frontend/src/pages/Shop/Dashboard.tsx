// src/pages/Shop/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getShopOrders } from '../../api/order';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCategories: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCategories: 0
  });
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopName, setShopName] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch shop info
        const shopResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/shops/by-owner/${user.id}`);
        if (!shopResponse.ok) throw new Error('Shop not found');
        const shopData = await shopResponse.json();

        if (shopData && shopData.id) {
          setShopId(shopData.id);
          setShopName(shopData.name || 'Cửa hàng của bạn');

          // Fetch products using the correct API
          const productsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/products/shop/${shopData.id}?type=all&sortBy=popular&bst=0`);
          const productsData = await productsResponse.json();
          const products = productsData || [];

          // Fetch orders using getShopOrders API (sử dụng hàm từ api/order.ts)
          let orders = [];
          let totalRevenue = 0;
          try {
            orders = await getShopOrders(null);
            // Calculate revenue from delivered orders
            totalRevenue = orders
              .filter((o: any) => o.status.toLowerCase() === 'delivered')
              .reduce((sum: number, o: any) => {
                const amount = parseFloat(o.total_amount);
                return sum + (isNaN(amount) ? 0 : amount);
              }, 0);
          } catch (err) {
            console.log('Could not fetch orders:', err);
            orders = [];
            totalRevenue = 0;
          }

          // Fetch categories using the correct API
          let categories = [];
          try {
            const token = localStorage.getItem('token');
            const categoriesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (categoriesResponse.ok) {
              categories = await categoriesResponse.json();
            }
          } catch (err) {
            console.log('Could not fetch categories:', err);
          }

          // Calculate stats
          setStats({
            totalProducts: products.length,
            activeProducts: products.filter((p: any) => p.status === 1).length,
            totalOrders: orders.length,
            pendingOrders: orders.filter((o: any) => o.status.toLowerCase() === 'pending').length,
            totalRevenue: totalRevenue,
            totalCategories: categories.length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
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
              <i className="bi bi-speedometer2" style={{ fontSize: '28px', color: '#FF9800' }}></i>
            </div>
            <div>
              <h1 className="mb-1" style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Dashboard
              </h1>
              <p className="mb-0" style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {shopName}
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => navigate('/seller/products/new')}
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
              <i className="bi bi-plus-circle-fill"></i>
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px 32px' }}>
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {/* Total Products */}
          <div className="col-md-6 col-lg-3">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #2196F3',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
              onClick={() => navigate('/seller/products')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p style={{ fontSize: '13px', color: '#999', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tổng sản phẩm
                  </p>
                  <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                    {stats.totalProducts}
                  </h3>
                  <small style={{ fontSize: '12px', color: '#2196F3', fontWeight: '600' }}>
                    <i className="bi bi-check-circle-fill me-1"></i>
                    {stats.activeProducts} đang hoạt động
                  </small>
                </div>
                <div style={{
                  backgroundColor: '#E3F2FD',
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-box-seam-fill" style={{ fontSize: '24px', color: '#2196F3' }}></i>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="col-md-6 col-lg-3">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #4CAF50',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
              onClick={() => navigate('/seller/orders')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p style={{ fontSize: '13px', color: '#999', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tổng đơn hàng
                  </p>
                  <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                    {stats.totalOrders}
                  </h3>
                  <small style={{ fontSize: '12px', color: '#FF9800', fontWeight: '600' }}>
                    <i className="bi bi-clock-fill me-1"></i>
                    {stats.pendingOrders} chờ xử lý
                  </small>
                </div>
                <div style={{
                  backgroundColor: '#E8F5E9',
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-receipt-cutoff" style={{ fontSize: '24px', color: '#4CAF50' }}></i>
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="col-md-6 col-lg-3">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #FF9800',
              transition: 'all 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p style={{ fontSize: '13px', color: '#999', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Doanh thu
                  </p>
                  <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </h3>
                  <small style={{ fontSize: '12px', color: '#4CAF50', fontWeight: '600' }}>
                    <i className="bi bi-arrow-up me-1"></i>
                    Tổng doanh thu
                  </small>
                </div>
                <div style={{
                  backgroundColor: '#FFF3E0',
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-currency-dollar" style={{ fontSize: '24px', color: '#FF9800' }}></i>
                </div>
              </div>
            </div>
          </div>

          {/* Total Categories */}
          <div className="col-md-6 col-lg-3">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #9C27B0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
              onClick={() => navigate('/seller/categories')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p style={{ fontSize: '13px', color: '#999', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Danh mục
                  </p>
                  <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                    {stats.totalCategories}
                  </h3>
                  <small style={{ fontSize: '12px', color: '#9C27B0', fontWeight: '600' }}>
                    <i className="bi bi-tags-fill me-1"></i>
                    Tổng danh mục
                  </small>
                </div>
                <div style={{
                  backgroundColor: '#F3E5F5',
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-collection-fill" style={{ fontSize: '24px', color: '#9C27B0' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-3">
          <div className="col-12">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                <i className="bi bi-lightning-charge-fill me-2" style={{ color: '#FF9800' }}></i>
                Thao tác nhanh
              </h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <button
                    onClick={() => navigate('/seller/products')}
                    className="w-100 btn d-flex flex-column align-items-center gap-2"
                    style={{
                      backgroundColor: '#F5F5F5',
                      border: 'none',
                      padding: '20px',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E3F2FD';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-box-seam" style={{ fontSize: '32px', color: '#2196F3' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Quản lý sản phẩm</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    onClick={() => navigate('/seller/orders')}
                    className="w-100 btn d-flex flex-column align-items-center gap-2"
                    style={{
                      backgroundColor: '#F5F5F5',
                      border: 'none',
                      padding: '20px',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E8F5E9';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-receipt-cutoff" style={{ fontSize: '32px', color: '#4CAF50' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Quản lý đơn hàng</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    onClick={() => navigate('/seller/categories')}
                    className="w-100 btn d-flex flex-column align-items-center gap-2"
                    style={{
                      backgroundColor: '#F5F5F5',
                      border: 'none',
                      padding: '20px',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3E5F5';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-tags" style={{ fontSize: '32px', color: '#9C27B0' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Quản lý danh mục</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    onClick={() => navigate('/seller/products/new')}
                    className="w-100 btn d-flex flex-column align-items-center gap-2"
                    style={{
                      backgroundColor: '#F5F5F5',
                      border: 'none',
                      padding: '20px',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFF3E0';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-plus-circle" style={{ fontSize: '32px', color: '#FF9800' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Thêm sản phẩm mới</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}