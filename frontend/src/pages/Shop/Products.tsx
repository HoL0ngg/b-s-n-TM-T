import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProductsByShopId, deleteProduct, updateProductStatus } from '../../api/products';
import { fetchShopCategories } from '../../api/shopCategory';
import type { ShopCategoryType } from '../../api/shopCategory';
import type { ProductType } from '../../types/ProductType';
import { Form, Modal, Button } from 'react-bootstrap';


type SortOption = 'popular' | 'new' | 'hot';

export default function ShopProductsManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryIdFromUrl = searchParams.get('category_id');

  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopCategories, setShopCategories] = useState<ShopCategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryIdFromUrl || 'all');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{ id: number, newStatus: number, name: string } | null>(null);

  // State cho Modal hiển thị lý do (Từ chối / Vi phạm)
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentReason, setCurrentReason] = useState<{ title: string, content: string } | null>(null);

  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [shopId, setShopId] = useState<number | null>(null);

  // ===== HÀM XỬ LÝ ẢNH THÔNG MINH =====
  const getImageUrl = (url: string | undefined) => {
    if (!url) return 'https://via.placeholder.com/150?text=No+Image';
    if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
    }
    if (url.startsWith('/uploads')) {
        return `http://localhost:5000${url}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchShopIdAndCategories = async () => {
      if (!user?.id) {
        setError('Không tìm thấy thông tin user');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/shops/by-owner/${user.id}`);
        if (!response.ok) throw new Error('Shop not found');
        const shopData = await response.json();

        if (shopData && shopData.id) {
          setShopId(shopData.id);
          try {
            const categoriesData = await fetchShopCategories();
            setShopCategories(categoriesData || []);
          } catch (catError) {
            console.error("Error fetching shop categories:", catError);
            setError(prev => prev ? (prev + " | Không thể tải danh mục shop") : "Không thể tải danh mục shop");
          }
        } else {
          setError('Không tìm thấy shop của user này');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching shop:', error);
        setError('Không thể tải thông tin shop');
        setLoading(false);
      }
    };
    fetchShopIdAndCategories();
  }, [user]);

  const loadProducts = useCallback(async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      setError('');
      const categoryId_generic = 0;
      const sortOption = sortBy === 'popular' ? 1 : sortBy === 'new' ? 2 : 3;
      const data = await fetchProductsByShopId(shopId, sortOption, categoryId_generic, true);
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, sortBy]);

  useEffect(() => {
    if (shopId) {
      loadProducts();
    }
  }, [shopId, loadProducts]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      const cateId = parseInt(selectedCategory, 10);
      filtered = filtered.filter(p => p.shop_cate_id === cateId);
    }
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    setFilteredProducts(filtered);
  };

  const handleAdd = () => navigate('/seller/products/new');
  const handleEdit = (product: ProductType) => navigate(`/seller/products/edit/${product.id}`);
  const handleView = (product: ProductType) => window.open(`/product/${product.id}`, '_blank');

  const handleDelete = (product: ProductType) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete?.id) return;
    try {
      await deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Không thể xóa sản phẩm');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // --- LOGIC BẬT/TẮT TRẠNG THÁI ---
  const initiateToggle = (product: ProductType) => {
    // Nếu đang chờ duyệt (0), từ chối (-1), hoặc bị khóa (-2) thì không cho thao tác switch
    if (product.status === 0 || product.status === -1 || product.status === -2) return;

    // Chỉ cho phép chuyển đổi giữa: 1 (Active) <-> 3 (Hidden/Tạm dừng)
    const newStatus = product.status === 1 ? 3 : 1;
    
    setPendingToggle({
      id: product.id,
      newStatus: newStatus,
      name: product.name
    });
    setShowStatusModal(true);
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;

    const originalProducts = [...products];
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === pendingToggle.id ? { ...p, status: pendingToggle.newStatus } : p
      )
    );

    try {
      await updateProductStatus(pendingToggle.id, pendingToggle.newStatus);
      setShowStatusModal(false);
      setPendingToggle(null);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      setProducts(originalProducts);
      setShowStatusModal(false);
    }
  };

  // --- LOGIC HIỂN THỊ LÝ DO ---
  const handleShowReason = (product: ProductType) => {
    if (product.status === -1) {
      setCurrentReason({
        title: 'Lý do từ chối',
        content: product.reject_reason || 'Không có lý do cụ thể. Vui lòng kiểm tra lại quy định đăng bán.'
      });
    } else if (product.status === -2) {
      setCurrentReason({
        title: 'Lý do vi phạm (Khóa)',
        content: product.ban_reason || 'Vi phạm chính sách cộng đồng nghiêm trọng.'
      });
    }
    setShowReasonModal(true);
  };

  if (!shopId && !loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-secondary" style={{ fontSize: '4rem' }}></i>
          <p className="text-muted mt-3">{error || 'Không tìm thấy thông tin shop'}</p>
        </div>
      </div>
    );
  }

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
              width: '56px', height: '56px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <i className="bi bi-box-seam" style={{ fontSize: '28px', color: '#FF9800' }}></i>
            </div>
            <div>
              <h1 className="mb-1" style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Quản lý Sản phẩm
              </h1>
              <p className="mb-0" style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {filteredProducts.length} / {products.length} sản phẩm
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="btn d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#fff',
              color: '#FF9800',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            <i className="bi bi-plus-circle-fill"></i>
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Main Content - FULL WIDTH */}
      <div style={{ padding: '24px 32px' }}>
        {error && (
          <div className="alert alert-danger mb-3" role="alert" style={{
            borderRadius: '8px',
            border: '1px solid #ffcdd2',
            backgroundColor: '#ffebee'
          }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {/* Filter Row */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="input-group" style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E0E0E0'
            }}>
              <span className="input-group-text bg-white border-0 ps-3" style={{ color: '#999' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: 'none', fontSize: '14px', padding: '12px 16px' }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E0E0E0'
            }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-0 ps-3">
                  <i className="bi bi-funnel-fill" style={{ color: '#FF9800', fontSize: '14px' }}></i>
                </span>
                <select
                  className="form-select border-0"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ boxShadow: 'none', fontSize: '14px', color: '#333', padding: '12px 16px' }}
                >
                  <option value="all">Tất cả danh mục</option>
                  {shopCategories.map(cate => (
                    <option key={cate.id} value={cate.id}>{cate.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E0E0E0'
            }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-0 ps-3">
                  <i className="bi bi-sort-down" style={{ color: '#FF9800', fontSize: '14px' }}></i>
                </span>
                <select
                  className="form-select border-0"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{ boxShadow: 'none', fontSize: '14px', color: '#333', padding: '12px 16px' }}
                >
                  <option value="popular">Phổ biến</option>
                  <option value="new">Mới nhất</option>
                  <option value="hot">Bán chạy</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table - FULL WIDTH */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F5F5F5' }}>
                <th style={{
                  fontSize: '12px', fontWeight: '700', color: '#666',
                  textTransform: 'uppercase', padding: '18px 24px',
                  backgroundColor: '#FAFAFA', letterSpacing: '0.5px'
                }}>
                  Sản phẩm
                </th>
                <th style={{
                  fontSize: '12px', fontWeight: '700', color: '#666',
                  textTransform: 'uppercase', padding: '18px 24px',
                  backgroundColor: '#FAFAFA', letterSpacing: '0.5px'
                }}>
                  Mô tả
                </th>
                <th style={{
                  fontSize: '12px', fontWeight: '700', color: '#666',
                  textTransform: 'uppercase', padding: '18px 24px',
                  backgroundColor: '#FAFAFA', letterSpacing: '0.5px'
                }}>
                  Giá
                </th>
                <th style={{
                  fontSize: '12px', fontWeight: '700', color: '#666',
                  textTransform: 'uppercase', padding: '18px 24px',
                  backgroundColor: '#FAFAFA', letterSpacing: '0.5px', textAlign: 'center'
                }}>
                  Đã bán
                </th>
                <th style={{
                  fontSize: '12px', fontWeight: '700', color: '#666',
                  textTransform: 'uppercase', padding: '18px 24px',
                  backgroundColor: '#FAFAFA', letterSpacing: '0.5px'
                }}>
                  Trạng thái
                </th>
                <th style={{
                  fontSize: '12px', fontWeight: '700', color: '#666',
                  textTransform: 'uppercase', padding: '18px 24px',
                  backgroundColor: '#FAFAFA', letterSpacing: '0.5px', textAlign: 'right'
                }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: index === filteredProducts.length - 1 ? 'none' : '1px solid #F5F5F5',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '18px 24px' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '8px',
                        overflow: 'hidden', backgroundColor: '#f8f8f8', flexShrink: 0,
                        border: '1px solid #E0E0E0'
                      }}>
                        {product.image_url ? (
                          <img
                            src={getImageUrl(product.image_url)}
                            alt={product.name || ''}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <i className="bi bi-image text-muted" style={{ fontSize: '24px' }}></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600', fontSize: '15px', color: '#333', marginBottom: '4px'
                        }}>
                          {product.name || 'N/A'}
                        </div>
                        <small style={{ color: '#999', fontSize: '13px', fontWeight: '500' }}>
                          ID: #{product.id}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', maxWidth: '300px' }}>
                    <div style={{
                      fontSize: '14px', color: '#666', overflow: 'hidden',
                      textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5'
                    }}>
                      {product.description || 'Chưa có mô tả'}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{
                      backgroundColor: '#FFF3E0', color: '#E65100',
                      padding: '6px 14px', borderRadius: '6px',
                      fontSize: '14px', fontWeight: '600', display: 'inline-block'
                    }}>
                      {formatPrice(product.base_price)}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', backgroundColor: '#E8F5E9', color: '#2E7D32',
                      fontWeight: '600', fontSize: '14px', padding: '6px 14px',
                      borderRadius: '6px', minWidth: '50px'
                    }}>
                      {product.sold_count || 0}
                    </span>
                  </td>

                  {/* === CỘT TRẠNG THÁI (ĐÃ CẬP NHẬT) === */}
                  <td style={{ padding: '18px 24px' }}>
                    <div className="d-flex flex-column gap-2">
                      
                      {/* 1. Case: Pending (0) - Chờ duyệt */}
                      {product.status === 0 && (
                         <div className="badge bg-warning text-dark border border-warning bg-opacity-25 p-2">
                            <i className="bi bi-hourglass-split me-1"></i> Đang chờ duyệt
                         </div>
                      )}

                      {/* 2. Case: Active (1) hoặc Hidden (3) -> Cho phép Toggle */}
                      {(product.status === 1 || product.status === 3) && (
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="switch"
                            id={`product-switch-${product.id}`}
                            checked={product.status === 1}
                            onChange={() => initiateToggle(product)}
                            style={{ fontSize: '14px', cursor: 'pointer' }}
                          />
                          <span style={{
                            fontSize: '13px', fontWeight: '500',
                            color: product.status === 1 ? '#2E7D32' : '#757575'
                          }}>
                            {product.status === 1 ? 'Đang bán' : 'Đã ẩn'}
                          </span>
                        </div>
                      )}

                      {/* 3. Case: Rejected (-1) - Từ chối */}
                      {product.status === -1 && (
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger p-2">
                                <i className="bi bi-x-circle me-1"></i> Bị từ chối
                            </span>
                            <button 
                                className="btn btn-sm btn-outline-danger py-0 px-2 ms-1" 
                                style={{fontSize: '12px', height: '24px'}}
                                onClick={() => handleShowReason(product)}
                            >
                                Xem lý do
                            </button>
                        </div>
                      )}

                      {/* 4. Case: Banned (-2) - Khóa */}
                      {product.status === -2 && (
                         <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark text-white p-2">
                                <i className="bi bi-ban me-1"></i> Vi phạm
                            </span>
                            <button 
                                className="btn btn-sm btn-outline-dark py-0 px-2 ms-1" 
                                style={{fontSize: '12px', height: '24px'}}
                                onClick={() => handleShowReason(product)}
                            >
                                Chi tiết
                            </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* === CỘT THAO TÁC (ĐÃ CẬP NHẬT) === */}
                  <td style={{ padding: '18px 24px' }}>
                    <div className="d-flex gap-2 justify-content-end">
                      {/* Nút Xem */}
                      <button
                        onClick={() => handleView(product)}
                        className="btn btn-sm p-0"
                        title="Xem chi tiết"
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                          backgroundColor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2196F3';
                          e.currentTarget.querySelector('i')!.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#E3F2FD';
                          e.currentTarget.querySelector('i')!.style.color = '#1976D2';
                        }}
                      >
                        <i className="bi bi-eye-fill" style={{ color: '#1976D2', fontSize: '15px' }}></i>
                      </button>

                      {/* Nút Sửa: ẨN KHI BỊ KHÓA (-2) */}
                      {product.status !== -2 && (
                        <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-sm p-0"
                            title="Chỉnh sửa"
                            style={{
                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                            backgroundColor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FF9800';
                            e.currentTarget.querySelector('i')!.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFF3E0';
                            e.currentTarget.querySelector('i')!.style.color = '#F57C00';
                            }}
                        >
                            <i className="bi bi-pencil-fill" style={{ color: '#F57C00', fontSize: '15px' }}></i>
                        </button>
                      )}

                      {/* Nút Xóa */}
                      <button
                        onClick={() => handleDelete(product)}
                        className="btn btn-sm p-0"
                        title="Xóa"
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                          backgroundColor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F44336'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFEBEE'}
                      >
                        <i className="bi bi-trash-fill" style={{ color: '#D32F2F', fontSize: '15px' }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#E0E0E0' }}></i>
              <p className="text-muted mt-3 mb-1" style={{ fontWeight: '600', fontSize: '16px', color: '#666' }}>
                Không tìm thấy sản phẩm nào
              </p>
              <small style={{ color: '#999', fontSize: '14px' }}>
                Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
              <div className="modal-body text-center" style={{ padding: '40px' }}>
                <div className="mb-3">
                  <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '64px', color: '#F44336' }}></i>
                </div>
                <h5 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '18px', color: '#333' }}>
                  Xác nhận xóa sản phẩm
                </h5>
                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                  Bạn có chắc chắn muốn xóa sản phẩm
                </p>
                <p style={{
                  color: '#333', fontWeight: '600', fontSize: '16px',
                  marginBottom: '12px', backgroundColor: '#F5F5F5',
                  padding: '8px 16px', borderRadius: '8px', display: 'inline-block'
                }}>
                  "{productToDelete.name}"
                </p>
                <div style={{
                  backgroundColor: '#FFEBEE', padding: '12px',
                  borderRadius: '8px', marginTop: '16px'
                }}>
                  <small className="text-danger" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Hành động này không thể hoàn tác
                  </small>
                </div>
              </div>
              <div className="modal-footer" style={{
                borderTop: '1px solid #f0f0f0', padding: '16px 24px',
                justifyContent: 'center', gap: '12px', backgroundColor: '#FAFAFA'
              }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn"
                  style={{
                    backgroundColor: '#fff', color: '#666', padding: '10px 24px',
                    borderRadius: '8px', border: '1px solid #E0E0E0', fontWeight: '500',
                    fontSize: '14px', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn"
                  style={{
                    backgroundColor: '#F44336', color: '#fff', padding: '10px 24px',
                    borderRadius: '8px', border: 'none', fontWeight: '600',
                    fontSize: '14px', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F44336'}
                >
                  <i className="bi bi-trash-fill me-2"></i>
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            borderBottom: 'none', padding: '20px 24px'
          }}
        >
          <Modal.Title style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
            <i className="bi bi-toggle-on me-2"></i>
            Xác nhận thay đổi trạng thái
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>
            Bạn có chắc chắn muốn
            <span className={`fw-bold mx-1`} style={{
              color: pendingToggle?.newStatus === 1 ? '#2E7D32' : '#757575'
            }}>
              {pendingToggle?.newStatus === 1 ? 'HIỂN THỊ (Bán lại)' : 'ẨN (Tạm ngưng bán)'}
            </span>
            sản phẩm
          </div>
          <div style={{
            backgroundColor: '#F5F5F5', padding: '12px 16px', borderRadius: '8px',
            margin: '16px 0', fontWeight: '600', fontSize: '15px', color: '#333'
          }}>
            "{pendingToggle?.name}"
          </div>
          <div style={{
            backgroundColor: pendingToggle?.newStatus === 3 ? '#EEEEEE' : '#E8F5E9',
            padding: '12px 16px', borderRadius: '8px', fontSize: '13px',
            color: '#666', lineHeight: '1.5'
          }}>
            <i className={`bi ${pendingToggle?.newStatus === 3 ? 'bi-eye-slash-fill text-secondary' : 'bi-check-circle-fill text-success'} me-2`}></i>
            {pendingToggle?.newStatus === 3
              ? "Sản phẩm sẽ bị ẩn khỏi danh sách dạo, khách hàng không tìm thấy."
              : "Sản phẩm sẽ hiển thị công khai cho khách hàng mua sắm."}
          </div>
        </Modal.Body>
        <Modal.Footer style={{
          borderTop: '1px solid #f0f0f0', padding: '16px 24px', backgroundColor: '#FAFAFA'
        }}>
          <Button
            variant="secondary"
            onClick={() => setShowStatusModal(false)}
            style={{
              backgroundColor: '#fff', color: '#666', border: '1px solid #E0E0E0',
              padding: '10px 24px', borderRadius: '8px', fontWeight: '500', fontSize: '14px'
            }}
          >
            Hủy
          </Button>
          <Button
            variant={pendingToggle?.newStatus === 1 ? "success" : "secondary"}
            onClick={confirmToggle}
            style={{
              backgroundColor: pendingToggle?.newStatus === 1 ? '#4CAF50' : '#757575',
              border: 'none', padding: '10px 24px', borderRadius: '8px',
              fontWeight: '600', fontSize: '14px'
            }}
          >
            <i className={`bi ${pendingToggle?.newStatus === 1 ? 'bi-check-circle-fill' : 'bi-eye-slash-fill'} me-2`}></i>
            Đồng ý
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL HIỂN THỊ LÝ DO (TỪ CHỐI / KHÓA) */}
      <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)} centered>
        <Modal.Header closeButton className="bg-white border-0 pb-0">
            <Modal.Title className="fs-5 text-danger fw-bold">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {currentReason?.title}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
            <div className="p-3 bg-light rounded border border-danger bg-opacity-10 text-dark">
                {currentReason?.content}
            </div>
            <div className="mt-3 text-muted small fst-italic">
                * Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ người bán.
            </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={() => setShowReasonModal(false)}>Đóng</Button>
            {currentReason?.title.includes('từ chối') && (
               <Button 
                    variant="primary" 
                    onClick={() => { 
                        setShowReasonModal(false);
                        // Nếu productToDelete đã được set (hoặc tìm cách truyền product vào đây), 
                        // có thể gọi handleEdit(product)
                        // Tạm thời đóng modal để user tự bấm nút sửa ở ngoài
                    }}
                >
                  Đã hiểu
               </Button>
            )}
        </Modal.Footer>
      </Modal>

    </div>
  );
}