import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import type { ProductVariantType } from '../types/ProductType';
import { apiGetVariantsForShop } from '../api/shop';

interface ProductPickerModalProps {
    show: boolean;
    onHide: () => void;
    shopId: number;
    onSave: (selectedVariants: ProductVariantType[]) => void;
    existingVariantIds?: number[];
}

export default function ProductPickerModal({
    show,
    onHide,
    shopId,
    onSave,
    existingVariantIds = []
}: ProductPickerModalProps) {

    const [allVariants, setAllVariants] = useState<ProductVariantType[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show && shopId) {
            setSelectedIds(new Set());
            setSearchTerm("");
            if (allVariants.length === 0) {
                setIsLoading(true);
                apiGetVariantsForShop(shopId)
                    .then(setAllVariants)
                    .catch((err: any) => console.error("Lỗi tải biến thể:", err))
                    .finally(() => setIsLoading(false));
            }
        }
    }, [show, shopId]);

    const filteredList = useMemo(() => {
        return allVariants.filter(variant => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                variant.product_name?.toLowerCase().includes(searchLower);
            const isNotExisting = !existingVariantIds.includes(variant.id);
            return matchesSearch && isNotExisting;
        });
    }, [allVariants, searchTerm, existingVariantIds]);

    const handleToggleSelect = (variantId: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(variantId)) newSet.delete(variantId);
            else newSet.add(variantId);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newIds = new Set(selectedIds);
            filteredList.forEach(v => newIds.add(v.id));
            setSelectedIds(newIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSaveClick = () => {
        const selectedObjects = allVariants.filter(v => selectedIds.has(v.id));
        onSave(selectedObjects);
        onHide();
    };

    // Nếu 'show' là false, không render gì cả (hoặc dùng CSS để ẩn)
    if (!show) return null;

    return (
        <>
            {/* Lớp nền tối (Backdrop) */}
            <div className="modal-backdrop fade show" onClick={onHide}></div>

            {/* Modal chính */}
            <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
                    <div className="modal-content">

                        {/* Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">Chọn sản phẩm</h5>
                            <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Thanh tìm kiếm */}
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaSearch /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm theo tên sản phẩm, mã SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && (
                                <div className="text-center my-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
                                </div>
                            )}

                            {/* Danh sách sản phẩm */}
                            {!isLoading && (
                                <div>
                                    {/* Header của list */}
                                    <div className="d-flex align-items-center p-2 bg-light border-bottom fw-bold sticky-top" style={{ zIndex: 1, top: '-1rem', margin: '0 -1rem' }}>
                                        <div className="form-check me-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={filteredList.length > 0 && filteredList.every(v => selectedIds.has(v.id))}
                                                onChange={handleSelectAll}
                                                disabled={filteredList.length === 0}
                                            />
                                        </div>
                                        <div className="flex-grow-1">Sản phẩm</div>
                                        <div style={{ width: '120px' }} className="text-end">Giá gốc</div>
                                        <div style={{ width: '80px' }} className="text-end">Kho</div>
                                    </div>

                                    {/* Danh sách items */}
                                    <div className="list-group list-group-flush">
                                        {filteredList.length > 0 ? (
                                            filteredList.map(variant => (
                                                <div
                                                    key={variant.id}
                                                    className={`list-group-item list-group-item-action d-flex align-items-center p-2 ${selectedIds.has(variant.id) ? 'bg-primary-subtle' : ''}`}
                                                    onClick={() => handleToggleSelect(variant.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="form-check me-3">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={selectedIds.has(variant.id)}
                                                            onChange={() => { }} // Đã xử lý ở onClick div cha
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>

                                                    <div className="d-flex align-items-center flex-grow-1">
                                                        <img
                                                            src={variant.image_url || '/assets/placeholder.png'}
                                                            alt=""
                                                            className="rounded border me-3"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                        <div>
                                                            <div className="fw-medium text-truncate" style={{ maxWidth: '300px' }} title={variant.product_name}>
                                                                {variant.product_name}
                                                            </div>
                                                            <small className="text-muted d-block">
                                                                {variant.options_string && <span className="ms-2">| {variant.options_string}</span>}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    <div style={{ width: '120px' }} className="text-end fw-medium">
                                                        {Number(variant.original_price).toLocaleString('vi-VN')}₫
                                                    </div>
                                                    <div style={{ width: '80px' }} className="text-end">
                                                        {variant.stock}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-5 text-muted">
                                                {searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp.' : 'Không có sản phẩm nào để hiển thị.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Đã chọn: <strong className="text-primary">{selectedIds.size}</strong> sản phẩm
                            </div>
                            <div>
                                <button type="button" className="btn btn-secondary me-2" onClick={onHide}>
                                    Hủy bỏ
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveClick}
                                    disabled={selectedIds.size === 0}
                                >
                                    Thêm vào sự kiện
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}