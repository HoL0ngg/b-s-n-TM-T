// Đường dẫn: frontend/src/pages/Shop/Products.tsx
// (PHIÊN BẢN CẢI TIẾN: Thêm Modal xác nhận bật/tắt)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
import { fetchProductsByShopId, deleteProduct, updateProductStatus } from '../../api/products'; 
import { fetchShopCategories } from '../../api/shopCategory'; 
import type { ShopCategoryType } from '../../api/shopCategory'; 
import type { ProductType } from '../../types/ProductType';
// Import thêm Button và Modal từ react-bootstrap
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
  
  // State cho Modal Xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);
  
  // ===== 1. STATE MỚI CHO MODAL TRẠNG THÁI =====
  const [showStatusModal, setShowStatusModal] = useState(false);
  // Lưu thông tin hành động đang chờ (ID sản phẩm, trạng thái muốn đổi thành, tên SP)
  const [pendingToggle, setPendingToggle] = useState<{ id: number, newStatus: number, name: string } | null>(null);
  // ============================================

  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [shopId, setShopId] = useState<number | null>(null);

  // (useEffect fetchShopIdAndCategories giữ nguyên)
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

  // (loadProducts giữ nguyên)
  const loadProducts = useCallback(async () => {
    if (!shopId) return;
    try {
        setLoading(true);
        setError('');
        const categoryId_generic = 0; 
        const sortOption = sortBy === 'popular' ? 1 : sortBy === 'new' ? 2 : 3;
        
        const data = await fetchProductsByShopId(shopId, sortOption, categoryId_generic);
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

  // ===== 2. HÀM KÍCH HOẠT MODAL (Khi bấm nút gạt) =====
  const initiateToggle = (product: ProductType, checked: boolean) => {
      const newStatus = checked ? 1 : 0; // 1 là Bật, 0 là Tắt
      // Lưu thông tin vào state tạm để hiển thị lên Modal
      setPendingToggle({
          id: product.id,
          newStatus: newStatus,
          name: product.name
      });
      setShowStatusModal(true); // Mở modal
  };
  // ====================================================

  // ===== 3. HÀM THỰC HIỆN (Khi bấm "Đồng ý" trên Modal) =====
  const confirmToggle = async () => {
    if (!pendingToggle) return;

    // 1. Cập nhật UI ngay lập tức (Optimistic Update)
    const originalProducts = [...products];
    setProducts(prevProducts => 
        prevProducts.map(p => 
            p.id === pendingToggle.id ? { ...p, status: pendingToggle.newStatus } : p
        )
    );

    try {
        // 2. Gọi API thật
        await updateProductStatus(pendingToggle.id, pendingToggle.newStatus);
        // Thành công -> Đóng modal, xóa state tạm
        setShowStatusModal(false);
        setPendingToggle(null);
    } catch (err) {
        // 3. Nếu thất bại -> Rollback
        console.error("Lỗi cập nhật trạng thái:", err);
        setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
        setProducts(originalProducts);
        setShowStatusModal(false); // Vẫn đóng modal
    }
  };
  // ==========================================================

  if (!shopId && !loading) {
    return (
        <div className="container mt-5">
            <div className="text-center">
                <i className="bi bi-exclamation-triangle text-secondary" style={{fontSize: '4rem'}}></i>
                <p className="text-muted mt-3">{error || 'Không tìm thấy thông tin shop'}</p>
            </div>
        </div>
    );
  }
  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div className="spinner-border text-warning" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  return (
    <div style={{backgroundColor: '#FAFAFA', minHeight: '100vh', paddingBottom: '40px'}}>
      {/* Header */}
      <div style={{background: 'linear-gradient(135deg, #FFD43B 0%, #FFC107 100%)', padding: '32px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    width: '56px', height: '56px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <i className="bi bi-box-seam" style={{fontSize: '28px', color: '#FF9800'}}></i>
                </div>
                <div>
                    <h1 className="mb-1" style={{fontSize: '28px', fontWeight: '700', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                        Quản lý Sản phẩm
                    </h1>
                    <p className="mb-0" style={{color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500'}}>
                        {filteredProducts.length} / {products.length} sản phẩm
                    </p>
                </div>
            </div>
            <button
              onClick={handleAdd} 
              className="btn d-flex align-items-center gap-2"
              style={{
                  backgroundColor: '#fff', color: '#FF9800', padding: '10px 20px',
                  borderRadius: '8px', border: 'none', fontWeight: '600',
                  fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
      </div>

      <div className="container mt-4">
        {error && (
            <div className="alert alert-danger mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
        )}

        {/* Filter Row */}
        <div className="row g-3 mb-3">
            <div className="col-md-6">
                <div className="input-group" style={{backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                    <span className="input-group-text bg-white border-0 ps-3" style={{color: '#999'}}><i className="bi bi-search"></i></span>
                    <input type="text" className="form-control border-0" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{boxShadow: 'none', fontSize: '14px'}}/>
                </div>
            </div>
            <div className="col-md-3">
                <div style={{backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #FFE0B2'}}>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-funnel-fill" style={{color: '#FF9800', fontSize: '14px'}}></i></span>
                        <select className="form-select border-0" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{boxShadow: 'none', fontSize: '14px', color: '#333'}}>
                            <option value="all">Tất cả danh mục shop</option>
                            {shopCategories.map(cate => (<option key={cate.id} value={cate.id}>{cate.name}</option>))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div style={{backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #FFE0B2'}}>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-sort-down" style={{color: '#FF9800', fontSize: '14px'}}></i></span>
                        <select className="form-select border-0" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} style={{boxShadow: 'none', fontSize: '14px', color: '#333'}}>
                            <option value="popular">Phổ biến</option>
                            <option value="new">Mới nhất</option>
                            <option value="hot">Bán chạy</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Products Table */}
        <div style={{backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
          <table className="table mb-0" style={{verticalAlign: 'middle'}}>
            <thead>
                <tr style={{borderBottom: '1px solid #f0f0f0'}}>
                    <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>Sản phẩm</th>
                    <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>Mô tả</th>
                    <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>Giá</th>
                    <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>Đã bán</th>
                    <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>Trạng thái</th>
                    <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA', textAlign: 'right'}}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} style={{borderBottom: '1px solid #f5f5f5'}}>
                  <td style={{padding: '16px 20px'}}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f8f8', flexShrink: 0, border: '1px solid #f0f0f0'}}>
                        {product.image_url ? (<img src={product.image_url} alt={product.name || ''} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>) : (<div className="d-flex align-items-center justify-content-center h-100"><i className="bi bi-image text-muted" style={{fontSize: '20px'}}></i></div>)}
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '2px'}}>{product.name || 'N/A'}</div>
                        <small style={{color: '#999', fontSize: '12px'}}>ID: {product.id}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{padding: '16px 20px', maxWidth: '280px'}}>
                    <div style={{fontSize: '13px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                      {product.description || 'Chưa có mô tả'}
                    </div>
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <span style={{backgroundColor: '#FFF3E0', color: '#E65100', padding: '5px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', display: 'inline-block'}}>
                      {formatPrice(product.base_price)}
                    </span>
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-cart-fill" style={{color: '#52c41a', fontSize: '14px'}}></i>
                      <span style={{fontWeight: '500', fontSize: '14px', color: '#333'}}>{product.sold_count || 0}</span>
                    </div>
                  </td>
                  
                  {/* ===== 4. SỬA: GỌI HÀM initiateToggle ===== */}
                  <td style={{padding: '16px 20px'}}>
                    <Form.Check 
                        type="switch"
                        id={`product-switch-${product.id}`}
                        checked={product.status === 1}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => initiateToggle(product, e.target.checked)} // Gọi hàm mở modal
                        label={product.status === 1 ? 'Hoạt động' : 'Tạm dừng'}
                    />
                  </td>
                  {/* ========================================== */}

                  <td style={{padding: '16px 20px'}}>
                    <div className="d-flex gap-2 justify-content-end">
                      <button onClick={() => handleView(product)} className="btn btn-sm p-0" title="Xem chi tiết" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #FFE0B2', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-eye-fill" style={{color: '#FF9800', fontSize: '14px'}}></i>
                      </button>
                      <button onClick={() => handleEdit(product)} className="btn btn-sm p-0" title="Chỉnh sửa" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #FFE0B2', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-pencil-fill" style={{color: '#F57C00', fontSize: '14px'}}></i>
                      </button>
                      <button onClick={() => handleDelete(product)} className="btn btn-sm p-0" title="Xóa" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #FFCDD2', backgroundColor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-trash-fill" style={{color: '#D32F2F', fontSize: '14px'}}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{fontSize: '48px', color: '#d9d9d9'}}></i>
              <p className="text-muted mt-3 mb-1" style={{fontWeight: '500', fontSize: '14px'}}>Không tìm thấy sản phẩm nào</p>
              <small style={{color: '#999', fontSize: '13px'}}>Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới</small>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.45)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{borderRadius: '8px', border: 'none'}}>
              <div className="modal-body text-center" style={{padding: '32px'}}>
                <div className="mb-3"><i className="bi bi-exclamation-circle-fill" style={{fontSize: '56px', color: '#ff4d4f'}}></i></div>
                <h5 style={{fontWeight: '600', marginBottom: '12px', fontSize: '16px'}}>Xác nhận xóa sản phẩm</h5>
                <p className="text-muted mb-2" style={{fontSize: '14px'}}>Bạn có chắc chắn muốn xóa sản phẩm</p>
                <p style={{color: '#333', fontWeight: '600', fontSize: '15px', marginBottom: '8px'}}>"{productToDelete.name}"</p>
                <small className="text-danger" style={{fontSize: '12px'}}>Hành động này không thể hoàn tác</small>
              </div>
              <div className="modal-footer" style={{borderTop: '1px solid #f0f0f0', padding: '16px 24px', justifyContent: 'center', gap: '12px'}}>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn" style={{ backgroundColor: '#fff', color: '#666', padding: '8px 24px', borderRadius: '6px', border: '1px solid #d9d9d9', fontWeight: '500', fontSize: '14px' }}>Hủy</button>
                <button onClick={confirmDelete} className="btn" style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '8px 24px', borderRadius: '6px', border: 'none', fontWeight: '500', fontSize: '14px' }}>Xác nhận xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 5. MODAL XÁC NHẬN TRẠNG THÁI ===== */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title style={{fontSize: '18px', fontWeight: '600'}}>Xác nhận thay đổi trạng thái</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Bạn có chắc chắn muốn 
            <span className={`fw-bold ${pendingToggle?.newStatus === 1 ? 'text-success' : 'text-danger'} mx-1`}>
                {pendingToggle?.newStatus === 1 ? 'BẬT (Hiển thị)' : 'TẮT (Ẩn)'}
            </span>
            sản phẩm <strong>"{pendingToggle?.name}"</strong> không?
            <div className="text-muted small mt-2">
                {pendingToggle?.newStatus === 0 
                    ? "Sản phẩm sẽ bị ẩn khỏi khách hàng và không thể mua được." 
                    : "Sản phẩm sẽ hiển thị trở lại trên cửa hàng."}
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                Hủy
            </Button>
            <Button 
                variant={pendingToggle?.newStatus === 1 ? "success" : "danger"} 
                onClick={confirmToggle}
            >
                Đồng ý
            </Button>
        </Modal.Footer>
      </Modal>
      {/* ======================================== */}

    </div>
  );
}