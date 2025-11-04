import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchProductsByShopId, createProduct, updateProduct, deleteProduct } from '../../api/products';
import type { ProductType } from '../../types/ProductType';

type ModalMode = 'add' | 'edit' | 'view';
type SortOption = 'popular' | 'new' | 'hot';

export default function ShopProductsManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [currentProduct, setCurrentProduct] = useState<Partial<ProductType> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [shopId, setShopId] = useState<number | null>(null);

  useEffect(() => {
    const fetchShopId = async () => {
      if (!user?.id) {
        setError('Không tìm thấy thông tin user');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/shops/by-owner/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Shop not found');
        }
        
        const shopData = await response.json();
        
        if (shopData && shopData.id) {
          setShopId(shopData.id);
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

    fetchShopId();
  }, [user]);

  const loadProducts = useCallback(async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      setError('');
      const categoryId = selectedCategory === 'all' ? 0 : parseInt(selectedCategory);
      const sortOption = sortBy === 'popular' ? 1 : sortBy === 'new' ? 2 : 3;
      const data = await fetchProductsByShopId(shopId, sortOption, categoryId);
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, sortBy, selectedCategory]);

  useEffect(() => {
    if (shopId) {
      loadProducts();
    }
  }, [shopId, loadProducts]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAdd = () => {
    setModalMode('add');
    setCurrentProduct({
      name: '',
      description: '',
      base_price: 0,
      image_url: '',
      status: 1,
    });
    setShowModal(true);
  };

  const handleEdit = (product: ProductType) => {
    setModalMode('edit');

    setCurrentProduct({
      ...product,
      status: product.status 
    });
    setShowModal(true);
  };

  
  const handleView = (product: ProductType) => {
    setModalMode('view');
    setCurrentProduct(product);
    setShowModal(true);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !shopId) return;
    
    setError('');
    
    try {
      if (modalMode === 'add') {
        await createProduct(shopId, currentProduct);
      } else if (modalMode === 'edit' && currentProduct.id) {
        await updateProduct(currentProduct.id, currentProduct);
      }
      await loadProducts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Không thể lưu sản phẩm');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

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
      {/* Header with Yellow Background */}
      <div style={{background: 'linear-gradient(135deg, #FFD43B 0%, #FFC107 100%)', padding: '32px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
        <div className="container">
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
                backgroundColor: '#fff',
                color: '#FF9800',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
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
      </div>

      {/* Main Content */}
      <div className="container mt-4">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Filter Row */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="input-group" style={{backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
              <span className="input-group-text bg-white border-0 ps-3" style={{color: '#999'}}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{boxShadow: 'none', fontSize: '14px'}}
              />
            </div>
          </div>

          <div className="col-md-3">
            <div style={{backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #FFE0B2'}}>
              <div className="input-group">
                <span className="input-group-text bg-white border-0 ps-3">
                  <i className="bi bi-funnel-fill" style={{color: '#FF9800', fontSize: '14px'}}></i>
                </span>
                <select
                  className="form-select border-0"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{boxShadow: 'none', fontSize: '14px', color: '#333'}}
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="1">Danh mục 1</option>
                  <option value="2">Danh mục 2</option>
                  <option value="3">Danh mục 3</option>
                  <option value="4">Danh mục 4</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div style={{backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #FFE0B2'}}>
              <div className="input-group">
                <span className="input-group-text bg-white border-0 ps-3">
                  <i className="bi bi-sort-down" style={{color: '#FF9800', fontSize: '14px'}}></i>
                </span>
                <select
                  className="form-select border-0"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{boxShadow: 'none', fontSize: '14px', color: '#333'}}
                >
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
                <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>
                  Sản phẩm
                </th>
                <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>
                  Mô tả
                </th>
                <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>
                  Giá
                </th>
                <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>
                  Đã bán
                </th>
                <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA'}}>
                  Trạng thái
                </th>
                <th style={{fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA', textAlign: 'right'}}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} style={{borderBottom: '1px solid #f5f5f5'}}>
                  <td style={{padding: '16px 20px'}}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        backgroundColor: '#f8f8f8',
                        flexShrink: 0,
                        border: '1px solid #f0f0f0'
                      }}>
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name || ''} 
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <i className="bi bi-image text-muted" style={{fontSize: '20px'}}></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '2px'}}>
                          {product.name || 'N/A'}
                        </div>
                        <small style={{color: '#999', fontSize: '12px'}}>ID: {product.id}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{padding: '16px 20px', maxWidth: '280px'}}>
                    <div style={{
                      fontSize: '13px', 
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {product.description || 'Chưa có mô tả'}
                    </div>
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <span style={{
                      backgroundColor: '#FFF3E0',
                      color: '#E65100',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {formatPrice(product.base_price)}
                    </span>
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-cart-fill" style={{color: '#52c41a', fontSize: '14px'}}></i>
                      <span style={{fontWeight: '500', fontSize: '14px', color: '#333'}}>{product.sold_count || 0}</span>
                    </div>
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <span style={{
                      backgroundColor: product.status === 1 ? '#E8F5E9' : '#FFEBEE',
                      color: product.status === 1 ? '#2E7D32' : '#C62828',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {product.status === 1 ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        onClick={() => handleView(product)}
                        className="btn btn-sm p-0"
                        title="Xem chi tiết"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #FFE0B2',
                          backgroundColor: '#FFF8E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="bi bi-eye-fill" style={{color: '#FF9800', fontSize: '14px'}}></i>
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn btn-sm p-0"
                        title="Chỉnh sửa"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #FFE0B2',
                          backgroundColor: '#FFF8E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="bi bi-pencil-fill" style={{color: '#F57C00', fontSize: '14px'}}></i>
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="btn btn-sm p-0"
                        title="Xóa"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #FFCDD2',
                          backgroundColor: '#FFEBEE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
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

      {/* Modal Add/Edit/View */}
      {showModal && currentProduct && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.45)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{borderRadius: '8px', border: 'none'}}>
              <div className="modal-header" style={{backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '16px 24px', background: 'linear-gradient(135deg, #FFE0B2 0%, #FFECB3 100%)'}}>
                <h5 className="modal-title d-flex align-items-center gap-2" style={{fontWeight: '600', color: '#E65100', fontSize: '16px'}}>
                  <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle-fill' : modalMode === 'edit' ? 'bi-pencil-square' : 'bi-eye-fill'}`} style={{fontSize: '18px'}}></i>
                  {modalMode === 'add' ? 'Thêm sản phẩm mới' : modalMode === 'edit' ? 'Chỉnh sửa sản phẩm' : 'Chi tiết sản phẩm'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{padding: '24px'}}>
                  <div className="mb-3">
                    <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                      Tên sản phẩm <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={currentProduct.name || ''}
                      onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                      className="form-control"
                      placeholder="Nhập tên sản phẩm"
                      style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                      Mô tả
                    </label>
                    <textarea
                      rows={4}
                      disabled={modalMode === 'view'}
                      value={currentProduct.description || ''}
                      onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                      className="form-control"
                      placeholder="Mô tả chi tiết về sản phẩm"
                      style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                        Giá bán (VNĐ) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        disabled={modalMode === 'view'}
                        value={currentProduct.base_price || 0}
                        onChange={(e) => setCurrentProduct({...currentProduct, base_price: Number(e.target.value) || 0})}
                        className="form-control"
                        placeholder="0"
                        style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                        Trạng thái <span className="text-danger">*</span>
                      </label>
                      <select
                        disabled={modalMode === 'view'}
                        value={currentProduct.status || 1}
                        onChange={(e) => setCurrentProduct({...currentProduct, status: Number(e.target.value)})}
                        className="form-select"
                        style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                      >
                        <option value="1">Hoạt động</option>
                        <option value="0">Tạm dừng</option>
                      </select>
                    </div>
                  </div>

                  {/* <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                        Danh mục shop
                      </label>
                      <select
                        disabled={modalMode === 'view'}
                        value={currentProduct.shop_cate_id || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, shop_cate_id: Number(e.target.value) || 0})}
                        className="form-select"
                        style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                      >
                        <option value="">Chọn danh mục</option>
                        <option value="1">Danh mục 1</option>
                        <option value="2">Danh mục 2</option>
                        <option value="3">Danh mục 3</option>
                        <option value="4">Danh mục 4</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                        Danh mục chính
                      </label>
                      <select
                        disabled={modalMode === 'view'}
                        value={currentProduct.category_id || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, category_id: Number(e.target.value) || 0})}
                        className="form-select"
                        style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                      >
                        <option value="">Chọn danh mục</option>
                        <option value="1">Danh mục 1</option>
                        <option value="2">Danh mục 2</option>
                        <option value="3">Danh mục 3</option>
                        <option value="4">Danh mục 4</option>
                      </select>
                    </div>
                  </div> */}

                  <div className="mb-3">
                    <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                      URL hình ảnh
                    </label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      value={currentProduct.image_url || ''}
                      onChange={(e) => setCurrentProduct({...currentProduct, image_url: e.target.value})}
                      className="form-control"
                      placeholder="https://example.com/image.jpg"
                      style={{borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9'}}
                    />
                  </div>

                  {currentProduct.image_url && (
                    <div className="mb-3">
                      <label className="form-label" style={{fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px'}}>
                        Preview
                      </label>
                      <div style={{width: '120px', height: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #f0f0f0'}}>
                        <img 
                          src={currentProduct.image_url} 
                          alt="Preview" 
                          style={{width: '100%', height: '100%', objectFit: 'cover'}}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {modalMode !== 'view' && (
                  <div className="modal-footer" style={{borderTop: '1px solid #f0f0f0', padding: '16px 24px'}}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn"
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor: '#FF9800',
                        color: '#fff',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      {modalMode === 'add' ? 'Thêm sản phẩm' : 'Cập nhật'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.45)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{borderRadius: '8px', border: 'none'}}>
              <div className="modal-body text-center" style={{padding: '32px'}}>
                <div className="mb-3">
                  <i className="bi bi-exclamation-circle-fill" style={{fontSize: '56px', color: '#ff4d4f'}}></i>
                </div>
                <h5 style={{fontWeight: '600', marginBottom: '12px', fontSize: '16px'}}>Xác nhận xóa sản phẩm</h5>
                <p className="text-muted mb-2" style={{fontSize: '14px'}}>Bạn có chắc chắn muốn xóa sản phẩm</p>
                <p style={{color: '#333', fontWeight: '600', fontSize: '15px', marginBottom: '8px'}}>
                  "{productToDelete.name}"
                </p>
                <small className="text-danger" style={{fontSize: '12px'}}>Hành động này không thể hoàn tác</small>
              </div>
              <div className="modal-footer" style={{borderTop: '1px solid #f0f0f0', padding: '16px 24px', justifyContent: 'center', gap: '12px'}}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn"
                  style={{
                    backgroundColor: '#fff',
                    color: '#666',
                    padding: '8px 24px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn"
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: '#fff',
                    padding: '8px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}