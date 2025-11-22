import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchShopCategories,
    createShopCategory,
    updateShopCategory,
    deleteShopCategory
} from '../../api/shopCategory';
import type { ShopCategoryType } from '../../api/shopCategory';

type ModalMode = 'add' | 'edit';

export default function ShopCategoriesManager() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ShopCategoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [currentCategory, setCurrentCategory] = useState<Partial<ShopCategoryType> | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<ShopCategoryType | null>(null);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await fetchShopCategories();
            setCategories(data || []);
        } catch (error: any) {
            console.error('Error loading shop categories:', error);
            setError(error.response?.data?.message || 'Không thể tải danh mục của shop');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleAdd = () => {
        setModalMode('add');
        setCurrentCategory({ name: '' });
        setShowModal(true);
        setError('');
    };

    const handleEdit = (category: ShopCategoryType) => {
        setModalMode('edit');
        setCurrentCategory({ ...category });
        setShowModal(true);
        setError('');
    };

    const handleDelete = (category: ShopCategoryType) => {
        setCategoryToDelete(category);
        setShowDeleteConfirm(true);
        setError('');
    };

    const confirmDelete = async () => {
        if (!categoryToDelete?.id) return;
        try {
            await deleteShopCategory(categoryToDelete.id);
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
        } catch (error: any) {
            console.error('Error deleting category:', error);
            setError(error.response?.data?.message || 'Không thể xóa danh mục');
            setShowDeleteConfirm(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCategory || !currentCategory.name?.trim()) {
            setError("Tên danh mục không được để trống");
            return;
        }
        setError('');
        try {
            if (modalMode === 'add') {
                await createShopCategory(currentCategory.name);
            } else if (modalMode === 'edit' && currentCategory.id) {
                await updateShopCategory(currentCategory.id, currentCategory.name);
            }
            await loadCategories();
            setShowModal(false);
            setCurrentCategory(null);
        } catch (error: any) {
            console.error('Error saving category:', error);
            setError(error.response?.data?.message || 'Không thể lưu danh mục');
        }
    };

    const handleViewProducts = (categoryId: number) => {
        navigate(`/seller/products?category_id=${categoryId}`);
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
                            <i className="bi bi-grid" style={{ fontSize: '28px', color: '#FF9800' }}></i>
                        </div>
                        <div>
                            <h1 className="mb-1" style={{ 
                                fontSize: '28px', 
                                fontWeight: '700', 
                                color: '#fff', 
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                            }}>
                               Danh mục sản phẩm
                            </h1>
                            <p className="mb-0" style={{ 
                                color: 'rgba(255,255,255,0.95)', 
                                fontSize: '14px', 
                                fontWeight: '500' 
                            }}>
                                {categories.length} danh mục
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
                        Thêm danh mục
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
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                {/* Categories Table - FULL WIDTH */}
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
                                    fontSize: '12px', 
                                    fontWeight: '700', 
                                    color: '#666', 
                                    textTransform: 'uppercase', 
                                    padding: '18px 24px', 
                                    backgroundColor: '#FAFAFA',
                                    letterSpacing: '0.5px'
                                }}>
                                    ID
                                </th>
                                <th style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '700', 
                                    color: '#666', 
                                    textTransform: 'uppercase', 
                                    padding: '18px 24px', 
                                    backgroundColor: '#FAFAFA',
                                    letterSpacing: '0.5px'
                                }}>
                                    Tên danh mục
                                </th>
                                <th style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '700', 
                                    color: '#666', 
                                    textTransform: 'uppercase', 
                                    padding: '18px 24px', 
                                    backgroundColor: '#FAFAFA',
                                    letterSpacing: '0.5px',
                                    textAlign: 'center'
                                }}>
                                    Số sản phẩm
                                </th>
                                <th style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '700', 
                                    color: '#666', 
                                    textTransform: 'uppercase', 
                                    padding: '18px 24px', 
                                    backgroundColor: '#FAFAFA',
                                    letterSpacing: '0.5px',
                                    textAlign: 'right' 
                                }}>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                                <tr 
                                    key={category.id} 
                                    style={{ 
                                        borderBottom: index === categories.length - 1 ? 'none' : '1px solid #F5F5F5',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '18px 24px' }}>
                                        <span style={{
                                            color: '#999', 
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}>
                                            #{category.id}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px' }}>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            fontSize: '15px', 
                                            color: '#333' 
                                        }}>
                                            {category.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            backgroundColor: '#E3F2FD',
                                            color: '#1976D2',
                                            fontWeight: '600', 
                                            fontSize: '14px',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            minWidth: '40px'
                                        }}>
                                            {category.product_count}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px' }}>
                                        <div className="d-flex gap-2 justify-content-end">
                                            <button
                                                onClick={() => handleViewProducts(category.id)}
                                                className="btn btn-sm p-0"
                                                title="Xem sản phẩm"
                                                style={{
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#E3F2FD',
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
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
                                                <i className="bi bi-eye-fill" style={{ color: '#1976D2', fontSize: '15px', transition: 'color 0.2s ease' }}></i>
                                            </button>
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="btn btn-sm p-0"
                                                title="Chỉnh sửa"
                                                style={{
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#FFF3E0',
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
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
                                                <i className="bi bi-pencil-fill" style={{ color: '#F57C00', fontSize: '15px', transition: 'color 0.2s ease' }}></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="btn btn-sm p-0"
                                                title="Xóa"
                                                style={{
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#FFEBEE',
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#F44336';
                                                    e.currentTarget.querySelector('i')!.style.color = '#fff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#FFEBEE';
                                                    e.currentTarget.querySelector('i')!.style.color = '#D32F2F';
                                                }}
                                            >
                                                <i className="bi bi-trash-fill" style={{ color: '#D32F2F', fontSize: '15px', transition: 'color 0.2s ease' }}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {categories.length === 0 && (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#E0E0E0' }}></i>
                            <p className="text-muted mt-3 mb-1" style={{ fontWeight: '600', fontSize: '16px', color: '#666' }}>
                                Chưa có danh mục nào
                            </p>
                            <small style={{ color: '#999', fontSize: '14px' }}>
                                Nhấn "Thêm danh mục" để bắt đầu
                            </small>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '12px', border: 'none', overflow: 'hidden' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header" style={{ 
                                    backgroundColor: '#fff', 
                                    borderBottom: '1px solid #f0f0f0', 
                                    padding: '20px 24px', 
                                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' 
                                }}>
                                    <h5 className="modal-title d-flex align-items-center gap-2" style={{ 
                                        fontWeight: '600', 
                                        color: '#fff', 
                                        fontSize: '18px' 
                                    }}>
                                        <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle-fill' : 'bi-pencil-square'}`}></i>
                                        {modalMode === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white" 
                                        onClick={() => { setShowModal(false); setError(''); }}
                                    ></button>
                                </div>
                                <div className="modal-body" style={{ padding: '24px' }}>
                                    {error && (
                                        <div className="alert alert-danger p-3 mb-3" style={{
                                            fontSize: '14px',
                                            borderRadius: '8px',
                                            border: '1px solid #ffcdd2',
                                            backgroundColor: '#ffebee'
                                        }} role="alert">
                                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                                            {error}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label" style={{ 
                                            fontWeight: '600', 
                                            fontSize: '14px', 
                                            color: '#333', 
                                            marginBottom: '8px' 
                                        }}>
                                            Tên danh mục <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={currentCategory?.name || ''}
                                            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                            className="form-control"
                                            placeholder="VD: Hàng mới về, Giảm giá hè..."
                                            style={{ 
                                                borderRadius: '8px', 
                                                padding: '12px 16px', 
                                                fontSize: '14px', 
                                                border: '1px solid #E0E0E0',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#FF9800';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(255,152,0,0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#E0E0E0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ 
                                    borderTop: '1px solid #f0f0f0', 
                                    padding: '16px 24px',
                                    backgroundColor: '#FAFAFA'
                                }}>
                                    <button 
                                        type="button" 
                                        onClick={() => { setShowModal(false); setError(''); }} 
                                        className="btn" 
                                        style={{ 
                                            backgroundColor: '#fff', 
                                            color: '#666', 
                                            padding: '10px 24px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #E0E0E0', 
                                            fontWeight: '500', 
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn" 
                                        style={{ 
                                            backgroundColor: '#FF9800', 
                                            color: '#fff', 
                                            padding: '10px 24px', 
                                            borderRadius: '8px', 
                                            border: 'none', 
                                            fontWeight: '600', 
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F57C00'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF9800'}
                                    >
                                        {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && categoryToDelete && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
                            <div className="modal-body text-center" style={{ padding: '40px' }}>
                                <div className="mb-3">
                                    <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '64px', color: '#F44336' }}></i>
                                </div>
                                <h5 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '18px', color: '#333' }}>
                                    Xác nhận xóa danh mục
                                </h5>
                                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                    Bạn có chắc chắn muốn xóa danh mục
                                </p>
                                <p style={{ 
                                    color: '#333', 
                                    fontWeight: '600', 
                                    fontSize: '16px', 
                                    marginBottom: '12px',
                                    backgroundColor: '#F5F5F5',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    display: 'inline-block'
                                }}>
                                    "{categoryToDelete.name}"
                                </p>
                                <div style={{
                                    backgroundColor: '#FFEBEE',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginTop: '16px'
                                }}>
                                    <small className="text-danger" style={{ fontSize: '13px', fontWeight: '500' }}>
                                        <i className="bi bi-info-circle-fill me-1"></i>
                                        Hành động này không thể hoàn tác
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ 
                                borderTop: '1px solid #f0f0f0', 
                                padding: '16px 24px', 
                                justifyContent: 'center', 
                                gap: '12px',
                                backgroundColor: '#FAFAFA'
                            }}>
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)} 
                                    className="btn" 
                                    style={{ 
                                        backgroundColor: '#fff', 
                                        color: '#666', 
                                        padding: '10px 24px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #E0E0E0', 
                                        fontWeight: '500', 
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
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
                                        backgroundColor: '#F44336', 
                                        color: '#fff', 
                                        padding: '10px 24px', 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        fontWeight: '600', 
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
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
        </div>
    );
}