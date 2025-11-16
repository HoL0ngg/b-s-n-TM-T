import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchShopCategories } from '../../api/shopCategory';
import type { ShopCategoryType } from '../../api/shopCategory';
import { fetchProductAttributes, createProduct } from '../../api/products';
import type { AttributeType } from '../../api/products';
import { useAuth } from '../../context/AuthContext';

interface Variation {
    value: string;
    price: number;
    stock: number;
    image_url?: string;
}
// NÂNG CẤP: Thêm kiểu (Type) cho Chi tiết
interface DetailItem {
    key: string;
    value: string;
}

export default function AddProduct() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shopId, setShopId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [shopCategories, setShopCategories] = useState<ShopCategoryType[]>([]);
    const [attributes, setAttributes] = useState<AttributeType[]>([]);

    // 1. Thông tin cơ bản
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [shopCateId, setShopCateId] = useState<number | null>(null);
    const [status, setStatus] = useState(1);

    // 2. Phân loại
    const [hasVariation, setHasVariation] = useState(false);
    const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null);
    const [variations, setVariations] = useState<Variation[]>([
        { value: '', price: 0, stock: 0, image_url: '' }
    ]);
    const [basePrice, setBasePrice] = useState(0);
    const [baseStock, setBaseStock] = useState(0);

    // 3. NÂNG CẤP: State cho "Chi tiết sản phẩm"
    const [details, setDetails] = useState<DetailItem[]>([
        { key: '', value: '' }
    ]);

    // (useEffect... giữ nguyên)
    useEffect(() => {
        const fetchShopId = async () => {
             if (!user?.id) return;
             try {
                const response = await fetch(`http://localhost:5000/api/shops/by-owner/${user.id}`);
                const shopData = await response.json();
                if (shopData && shopData.id) {
                    setShopId(shopData.id);
                }
             } catch (e) { console.error(e); }
        };
        const loadInitialData = async () => {
            try {
                const [categories, attrs] = await Promise.all([
                    fetchShopCategories(),
                    fetchProductAttributes()
                ]);
                setShopCategories(categories || []);
                setAttributes(attrs || []);
            } catch (err) {
                setError("Không thể tải dữ liệu danh mục hoặc thuộc tính.");
            }
        };
        fetchShopId();
        loadInitialData();
    }, [user]);

    // (Hàm xử lý Phân loại... giữ nguyên)
    const handleVariationChange = (index: number, field: keyof Variation, value: string | number) => {
        const newVariations = [...variations];
        (newVariations[index] as any)[field] = value;
        setVariations(newVariations);
    };
    const handleAddVariation = () => {
        setVariations([...variations, { value: '', price: 0, stock: 0, image_url: '' }]);
    };
    const handleRemoveVariation = (index: number) => {
        if (variations.length <= 1) return;
        const newVariations = variations.filter((_, i) => i !== index);
        setVariations(newVariations);
    };

    // NÂNG CẤP: Hàm xử lý "Chi tiết sản phẩm"
    const handleDetailChange = (index: number, field: keyof DetailItem, value: string) => {
        const newDetails = [...details];
        newDetails[index][field] = value;
        setDetails(newDetails);
    };
    const handleAddDetail = () => {
        setDetails([...details, { key: '', value: '' }]);
    };
    const handleRemoveDetail = (index: number) => {
        if (details.length <= 1) { // Nếu là dòng cuối, chỉ xóa chữ
            setDetails([{ key: '', value: '' }]);
            return;
        }
        const newDetails = details.filter((_, i) => i !== index);
        setDetails(newDetails);
    };

    // NÂNG CẤP: Gửi 'details' lên backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId) {
            setError("Lỗi: Không tìm thấy ID của shop.");
            return;
        }
        setLoading(true);
        setError('');

        // Lọc bỏ các chi tiết rỗng
        const filteredDetails = details.filter(d => d.key.trim() !== '' && d.value.trim() !== '');

        let productData: any = {
            name,
            description,
            image_url: imageUrl,
            shop_cate_id: shopCateId,
            status,
            details: filteredDetails // <-- NÂNG CẤP
        };

        if (hasVariation) {
            if (!selectedAttributeId) {
                setError("Vui lòng chọn tên nhóm phân loại (ví dụ: Màu sắc).");
                setLoading(false);
                return;
            }
            productData = {
                ...productData,
                attribute_id: selectedAttributeId,
                variations: variations.map(v => ({
                    ...v,
                    price: Number(v.price),
                    stock: Number(v.stock)
                }))
            };
        } else {
            productData = {
                ...productData,
                base_price: basePrice,
                stock: baseStock
            };
        }

        try {
            await createProduct(productData); 
            setLoading(false);
            navigate('/seller/products');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Đã xảy ra lỗi khi tạo sản phẩm.");
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
                {/* (Phần Header giữ nguyên) */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>Thêm sản phẩm mới</h3>
                    <div>
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/seller/products')}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Đang lưu..." : (status === 1 ? "Lưu & Đăng bán" : "Lưu nháp")}
                        </button>
                    </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* (Thẻ Thông tin cơ bản giữ nguyên) */}
                <div className="card shadow-sm mb-3">
                    <div className="card-header">Thông tin cơ bản</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả sản phẩm</label>
                            <textarea className="form-control" rows={5} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Link ảnh chính</label>
                                <input type="text" className="form-control" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Loại sản phẩm (Kệ hàng)</label>
                                <select className="form-select" value={shopCateId || ''} onChange={(e) => setShopCateId(Number(e.target.value) || null)}>
                                    <option value="">-- Chọn loại sản phẩm --</option>
                                    {shopCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== NÂNG CẤP: THÊM THẺ "CHI TIẾT SẢN PHẨM" ===== */}
                <div className="card shadow-sm mb-3">
                    <div className="card-header">Chi tiết sản phẩm</div>
                    <div className="card-body">
                        {details.map((detail, index) => (
                             <div key={index} className="row align-items-center mb-2">
                                <div className="col-md-5">
                                    <label className="form-label">Thuộc tính</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="ví dụ: Thương hiệu" 
                                        value={detail.key} 
                                        onChange={(e) => handleDetailChange(index, 'key', e.target.value)} 
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label">Giá trị</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="ví dụ: Maybelline" 
                                        value={detail.value} 
                                        onChange={(e) => handleDetailChange(index, 'value', e.target.value)} 
                                    />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-danger btn-sm" 
                                        onClick={() => handleRemoveDetail(index)}
                                    >Xóa</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-link" onClick={handleAddDetail}>+ Thêm chi tiết</button>
                    </div>
                </div>
                {/* =================================================== */}


                {/* (Thẻ Thông tin bán hàng giữ nguyên) */}
                <div className="card shadow-sm mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        Thông tin bán hàng
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="hasVariationSwitch" checked={hasVariation} onChange={(e) => setHasVariation(e.target.checked)} />
                            <label className="form-check-label" htmlFor="hasVariationSwitch">Bật phân loại</label>
                        </div>
                    </div>
                    <div className="card-body">
                        {hasVariation ? (
                            <div>
                                <div className="mb-3">
                                    <label className="form-label">Tên nhóm phân loại <span className="text-danger">*</span></label>
                                    <select className="form-select" value={selectedAttributeId || ''} onChange={(e) => setSelectedAttributeId(Number(e.target.value) || null)}>
                                        <option value="">-- Chọn thuộc tính (ví dụ: Màu sắc) --</option>
                                        {attributes.map(attr => (
                                            <option key={attr.id} value={attr.id}>{attr.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <hr />
                                {variations.map((variation, index) => (
                                    <div key={index} className="row align-items-center mb-2 p-2 border rounded">
                                        <div className="col-md-3">
                                            <label className="form-label">Tên phân loại <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder="ví dụ: Đỏ" value={variation.value} onChange={(e) => handleVariationChange(index, 'value', e.target.value)} required />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Giá <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" value={variation.price} onChange={(e) => handleVariationChange(index, 'price', Number(e.target.value))} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">Kho <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" value={variation.stock} onChange={(e) => handleVariationChange(index, 'stock', Number(e.target.value))} required />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Link ảnh (nếu có)</label>
                                            <input type="text" className="form-control" placeholder="Link ảnh cho màu này" value={variation.image_url || ''} onChange={(e) => handleVariationChange(index, 'image_url', e.target.value)} />
                                        </div>
                                        <div className="col-md-1 d-flex align-items-end">
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveVariation(index)} disabled={variations.length <= 1}>Xóa</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-link" onClick={handleAddVariation}>+ Thêm phân loại (ví dụ: Xanh)</button>
                            </div>
                        ) : (
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Giá <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} required={!hasVariation} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Kho hàng <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" value={baseStock} onChange={(e) => setBaseStock(Number(e.target.value))} required={!hasVariation} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* (Thẻ Trạng thái và Nút bấm giữ nguyên) */}
                <div className="card shadow-sm mb-3">
                     <div className="card-header">Trạng thái đăng bán</div>
                     <div className="card-body">
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="statusRadio" id="statusPublish" value={1} checked={status === 1} onChange={(e) => setStatus(Number(e.target.value))} />
                            <label className="form-check-label" htmlFor="statusPublish">Đăng bán (Công khai)</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="statusRadio" id="statusDraft" value={0} checked={status === 0} onChange={(e) => setStatus(Number(e.target.value))} />
                            <label className="form-check-label" htmlFor="statusDraft">Lưu nháp (Ẩn)</label>
                        </div>
                     </div>
                </div>
                <div className="d-flex justify-content-end mb-5">
                    <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/seller/products')}>Hủy</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Đang lưu..." : (status === 1 ? "Lưu & Đăng bán" : "Lưu nháp")}
                    </button>
                </div>
            </form>
        </div>
    );
}