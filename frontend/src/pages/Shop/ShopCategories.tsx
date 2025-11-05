import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchShopCategories,
    createShopCategory,
    updateShopCategory,
    deleteShopCategory
} from '../../api/shopCategory';
// Sửa lỗi: Import 'ShopCategoryType' bằng 'import type'
import type { ShopCategoryType } from '../../api/shopCategory';

type ModalMode = 'add' | 'edit';

export default function ShopCategoriesManager() {
    const [categories, setCategories] = useState<ShopCategoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [currentCategory, setCurrentCategory] = useState<Partial<ShopCategoryType> | null>(null);
    
    // State cho Xóa
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

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #FFD43B 0%, #FFC107 100%)', padding: '32px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                width: '56px', height: '56px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <i className="bi bi-tags-fill" style={{ fontSize: '28px', color: '#FF9800' }}></i>
                            </div>
                            <div>
                                <h1 className="mb-1" style={{ fontSize: '28px', fontWeight: '700', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    Loại sản phẩm
                                </h1>
                                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                                    {categories.length} danh mục
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
                            Thêm danh mục
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mt-4">
                {error && (
                    <div className="alert alert-danger mb-3" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                {/* Categories Table */}
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <th style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA' }}>
                                    ID
                                </th>
                                <th style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA' }}>
                                    Tên danh mục
                                </th>
                                <th style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', padding: '16px 20px', backgroundColor: '#FAFAFA', textAlign: 'right' }}>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{color: '#999', fontSize: '13px'}}>#{category.id}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                                            {category.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div className="d-flex gap-2 justify-content-end">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="btn btn-sm p-0"
                                                title="Chỉnh sửa"
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '6px',
                                                    border: '1px solid #FFE0B2', backgroundColor: '#FFF8E1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <i className="bi bi-pencil-fill" style={{ color: '#F57C00', fontSize: '14px' }}></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="btn btn-sm p-0"
                                                title="Xóa"
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '6px',
                                                    border: '1px solid #FFCDD2', backgroundColor: '#FFEBEE',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <i className="bi bi-trash-fill" style={{ color: '#D32F2F', fontSize: '14px' }}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {categories.length === 0 && (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#d9d9d9' }}></i>
                            <p className="text-muted mt-3 mb-1" style={{ fontWeight: '500', fontSize: '14px' }}>Chưa có danh mục nào</p>
                            <small style={{ color: '#999', fontSize: '13px' }}>Nhấn "Thêm danh mục" để bắt đầu</small>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '8px', border: 'none' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header" style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '16px 24px', background: 'linear-gradient(135deg, #FFE0B2 0%, #FFECB3 100%)' }}>
                                    <h5 className="modal-title d-flex align-items-center gap-2" style={{ fontWeight: '600', color: '#E65100', fontSize: '16px' }}>
                                        <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle-fill' : 'bi-pencil-square'}`}></i>
                                        {modalMode === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => { setShowModal(false); setError(''); }}
                                    ></button>
                                </div>

                                <div className="modal-body" style={{ padding: '24px' }}>
                                    {error && (
                                        <div className="alert alert-danger p-2" style={{fontSize: '13px'}} role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label" style={{ fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px' }}>
                                            Tên danh mục <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={currentCategory?.name || ''}
                                            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                            className="form-control"
                                            placeholder="VD: Hàng mới về, Giảm giá hè..."
                                            style={{ borderRadius: '6px', padding: '10px 12px', fontSize: '14px', border: '1px solid #d9d9d9' }}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ borderTop: '1px solid #f0f0f0', padding: '16px 24px' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); setError(''); }}
                                        className="btn"
                                        style={{
                                            backgroundColor: '#f5f5f5', color: '#666', padding: '8px 20px',
                                            borderRadius: '6px', border: '1px solid #e0e0e0',
                                            fontWeight: '500', fontSize: '14px'
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn"
                                        style={{
                                            backgroundColor: '#FF9800', color: '#fff', padding: '8px 20px',
                                            borderRadius: '6px', border: 'none',
                                            fontWeight: '500', fontSize: '14px'
                                        }}
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
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '8px', border: 'none' }}>
                            <div className="modal-body text-center" style={{ padding: '32px' }}>
                                <div className="mb-3">
                                    <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '56px', color: '#ff4d4f' }}></i>
                                </div>
                                <h5 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '16px' }}>Xác nhận xóa danh mục</h5>
                                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>Bạn có chắc chắn muốn xóa danh mục</p>
                                <p style={{ color: '#333', fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>
                                    "{categoryToDelete.name}"
                                </p>
                                <small className="text-danger" style={{ fontSize: '12px' }}>Hành động này không thể hoàn tác</small>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #f0f0f0', padding: '16px 24px', justifyContent: 'center', gap: '12px' }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="btn"
                                    style={{
                                        backgroundColor: '#fff', color: '#666', padding: '8px 24px',
                                        borderRadius: '6px', border: '1px solid #d9d9d9',
                                        fontWeight: '500', fontSize: '14px'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="btn"
                                    style={{
                                        backgroundColor: '#ff4d4f', color: '#fff', padding: '8px 24px',
                                        borderRadius: '6px', border: 'none',
                                        fontWeight: '500', fontSize: '14px'
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