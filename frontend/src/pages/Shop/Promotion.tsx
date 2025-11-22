// src/pages/Shop/PromotionManagementPage.tsx
import { useState, useEffect, useCallback } from 'react';
import type { ProductVariantType, PromotionItem, PromotionType } from '../../types/ProductType';
import { apiDeletePromotionItem, apiGetPromotionDetails, apiGetShopPromotions, apiSavePromotionDetails } from '../../api/products';
import DateRangeDisplay from '../../components/DateRangeDisplay';
import CreatePromotionModal from '../../components/CreatePromotionModal';
import ProductPickerModal from '../../components/ProductPickerModal';

export default function Promotion() {
    const [promotions, setPromotions] = useState<PromotionType[]>([]);
    const [selectedPromo, setSelectedPromo] = useState<PromotionType | null>(null);
    const [promoItems, setPromoItems] = useState<PromotionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPromotions = useCallback(() => {
        apiGetShopPromotions().then(setPromotions);
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    // Tải chi tiết (sản phẩm) khi chọn 1 sự kiện
    useEffect(() => {
        if (selectedPromo) {
            setIsLoading(true);
            apiGetPromotionDetails(selectedPromo.id)
                .then(setPromoItems)
                .finally(() => setIsLoading(false));
        } else {
            setPromoItems([]); // Xóa danh sách nếu không chọn
        }
    }, [selectedPromo]);

    // --- HÀM XỬ LÝ ---

    const handleDiscountChange = (variantId: number, newValueString: string) => {
        const newValue = newValueString === '' ? 0 : Number(newValueString);
        setPromoItems(currentItems =>
            currentItems.map(item =>
                item.product_variant_id === variantId
                    ? { ...item, discount_value: newValue }
                    : item
            )
        );
    };

    const handleSaveChanges = async () => {
        if (!selectedPromo) return;

        try {
            await apiSavePromotionDetails(selectedPromo.id, promoItems);
            alert("Đã lưu thay đổi!");
            setSelectedPromo(null);
        } catch (error) {
            alert("Lỗi! Không thể lưu.");
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        fetchPromotions();
    };

    const handleDeleteItem = async (variantId: number) => {
        if (!selectedPromo || !window.confirm("Bạn chắc chắn muốn xóa?")) return;

        try {
            await apiDeletePromotionItem(selectedPromo.id, variantId);
            setPromoItems(current => current.filter(item => item.product_variant_id !== variantId));
        } catch (error) {
            alert("Lỗi khi xóa sản phẩm.");
        }
    };

    const handleAddProducts = (selectedVariants: ProductVariantType[]) => {
        const newItems: PromotionItem[] = selectedVariants.map(variant => ({
            promotion_id: selectedPromo!.id,
            product_variant_id: variant.id,
            discount_value: 10,
            original_price: variant.original_price,
            stock: variant.stock,
            product_name: variant.product_name || '',
            product_image: variant.image_url,
        }));

        setPromoItems(current => [...current, ...newItems.filter(
            newItem => !current.some(c => c.product_variant_id === newItem.product_variant_id)
        )]);

        setIsProductPickerOpen(false);
    };

    if (isLoading && !selectedPromo) {
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
                            <i className="bi bi-percent" style={{ fontSize: '28px', color: '#FF9800' }}></i>
                        </div>
                        <div>
                            <h1 className="mb-1" style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#fff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                Quản lý khuyến mãi
                            </h1>
                            <p className="mb-0" style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Tạo và quản lý các chương trình giảm giá
                            </p>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
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
                            Tạo sự kiện mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px 32px' }}>
                <div className="row g-3">
                    {/* --- CỘT 1: DANH SÁCH SỰ KIỆN --- */}
                    <div className="col-md-4">
                        <div style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            minHeight: '600px'
                        }}>
                            <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                                <i className="bi bi-calendar-event me-2" style={{ color: '#FF9800' }}></i>
                                Danh sách sự kiện
                            </h5>
                            
                            {promotions && promotions.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                    {promotions.map(promo => (
                                        <div
                                            key={promo.id}
                                            onClick={() => setSelectedPromo(promo)}
                                            style={{
                                                backgroundColor: selectedPromo?.id === promo.id ? '#E3F2FD' : '#F5F5F5',
                                                borderRadius: '10px',
                                                padding: '16px',
                                                cursor: 'pointer',
                                                border: selectedPromo?.id === promo.id ? '2px solid #2196F3' : '2px solid transparent',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedPromo?.id !== promo.id) {
                                                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedPromo?.id !== promo.id) {
                                                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: '600', 
                                                    color: '#333' 
                                                }}>
                                                    {promo.name}
                                                </span>
                                                {selectedPromo?.id === promo.id && (
                                                    <i className="bi bi-check-circle-fill" style={{ color: '#2196F3' }}></i>
                                                )}
                                            </div>
                                            <DateRangeDisplay
                                                startDate={promo.start_date}
                                                endDate={promo.end_date}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                                    <p style={{ fontSize: '14px', marginBottom: '0' }}>Chưa có sự kiện nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- CỘT 2: CHI TIẾT SỰ KIỆN --- */}
                    <div className="col-md-8">
                        {selectedPromo ? (
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                overflow: 'hidden'
                            }}>
                                {/* Header */}
                                <div style={{
                                    backgroundColor: '#F5F5F5',
                                    padding: '20px 24px',
                                    borderBottom: '1px solid #E0E0E0'
                                }}>
                                    <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '0' }}>
                                        <i className="bi bi-tag-fill me-2" style={{ color: '#FF9800' }}></i>
                                        Chi tiết: {selectedPromo.name}
                                    </h5>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '24px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <strong style={{ fontSize: '15px', color: '#333' }}>
                                            Sản phẩm áp dụng ({promoItems.length})
                                        </strong>
                                        <button
                                            className="btn d-flex align-items-center gap-2"
                                            onClick={() => setIsProductPickerOpen(true)}
                                            style={{
                                                backgroundColor: '#2196F3',
                                                color: '#fff',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontWeight: '600',
                                                fontSize: '13px'
                                            }}
                                        >
                                            <i className="bi bi-plus-circle"></i>
                                            Thêm sản phẩm
                                        </button>
                                    </div>

                                    {isLoading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Đang tải...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            overflowY: 'auto', 
                                            maxHeight: '450px',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '8px'
                                        }}>
                                            <table className="table table-hover mb-0">
                                                <thead style={{ 
                                                    backgroundColor: '#FAFAFA',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 1
                                                }}>
                                                    <tr>
                                                        <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '12px 16px' }}>Sản phẩm</th>
                                                        <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '12px 16px', width: '150px' }}>Giảm giá (%)</th>
                                                        <th style={{ fontSize: '13px', fontWeight: '600', color: '#666', padding: '12px 16px', width: '80px', textAlign: 'center' }}>Xóa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {promoItems.length > 0 ? promoItems.map(item => (
                                                        <tr key={item.product_variant_id}>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <div>
                                                                    <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                                                                        {item.product_name}
                                                                    </span>
                                                                    {item.options_string && (
                                                                        <small className='d-block mt-1 fst-italic' style={{ color: '#2196F3', fontSize: '12px' }}>
                                                                            {item.options_string}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <div className="input-group input-group-sm">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        value={item.discount_value}
                                                                        onChange={(e) => handleDiscountChange(item.product_variant_id, e.target.value)}
                                                                        min={0}
                                                                        max={100}
                                                                        style={{
                                                                            borderRadius: '6px',
                                                                            fontSize: '13px'
                                                                        }}
                                                                    />
                                                                    <span className="input-group-text" style={{ 
                                                                        borderRadius: '0 6px 6px 0',
                                                                        fontSize: '13px'
                                                                    }}>%</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                <button 
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleDeleteItem(item.product_variant_id)}
                                                                    style={{
                                                                        backgroundColor: '#FFEBEE',
                                                                        color: '#F44336',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        padding: '4px 12px'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                                                <i className="bi bi-inbox" style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }}></i>
                                                                Chưa có sản phẩm nào
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{
                                    backgroundColor: '#F5F5F5',
                                    padding: '16px 24px',
                                    borderTop: '1px solid #E0E0E0',
                                    textAlign: 'right'
                                }}>
                                    <button 
                                        className="btn d-inline-flex align-items-center gap-2"
                                        onClick={handleSaveChanges}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: '#fff',
                                            padding: '10px 24px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontWeight: '600',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <i className="bi bi-check-circle"></i>
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                padding: '80px 40px',
                                textAlign: 'center',
                                minHeight: '600px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="bi bi-cursor" style={{ fontSize: '64px', color: '#E0E0E0', marginBottom: '24px' }}></i>
                                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#999', marginBottom: '8px' }}>
                                    Chọn một sự kiện
                                </h5>
                                <p style={{ fontSize: '14px', color: '#BBB', marginBottom: '0' }}>
                                    Chọn sự kiện từ danh sách bên trái để xem chi tiết
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedPromo && (
                <ProductPickerModal
                    show={isProductPickerOpen}
                    onHide={() => setIsProductPickerOpen(false)}
                    shopId={selectedPromo.shop_id}
                    onSave={handleAddProducts}
                />
            )}

            <CreatePromotionModal
                show={isCreateModalOpen}
                onHide={() => setIsCreateModalOpen(false)}
                onSaveSuccess={handleCreateSuccess}
            />
        </div>
    );
}