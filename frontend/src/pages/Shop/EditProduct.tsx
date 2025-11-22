import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchShopCategories } from '../../api/shopCategory';
import type { ShopCategoryType } from '../../api/shopCategory';
import { fetchProductAttributes, updateProduct, fetchProductForEdit } from '../../api/products';
import type { AttributeType } from '../../api/products';
import TiptapEditor from '../../components/TipTapEditor';
import { useAuth } from '../../context/AuthContext'; 

interface Variation {
    value: string;
    price: number;
    stock: number;
    image_url?: string;
    file?: File;      // <--- MỚI: Lưu file gốc
    preview?: string; // <--- MỚI: Lưu link preview
}
interface DetailItem {
    key: string;
    value: string;
}

export default function EditProduct() {
    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { } = useAuth();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [shopCategories, setShopCategories] = useState<ShopCategoryType[]>([]);
    const [attributes, setAttributes] = useState<AttributeType[]>([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    // ===== STATE CHO ẢNH CHÍNH =====
    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [imagePreview, setImagePreview] = useState<string>('');   
    // ===============================

    const [shopCateId, setShopCateId] = useState<number | null>(null);
    const [status, setStatus] = useState(1);
    const [hasVariation, setHasVariation] = useState(false);
    const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null);
    const [variations, setVariations] = useState<Variation[]>([
        { value: '', price: 0, stock: 0, image_url: '' }
    ]);
    const [basePrice, setBasePrice] = useState(0);
    const [baseStock, setBaseStock] = useState(0);

    const [details, setDetails] = useState<DetailItem[]>([
        { key: '', value: '' }
    ]);

    // Hàm xử lý URL ảnh thông minh (Dùng chung cho cả ảnh chính và biến thể)
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        return `http://localhost:5000${url}`;
    };

    useEffect(() => {
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
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!productId) {
            setError("Không tìm thấy ID sản phẩm.");
            setPageLoading(false);
            return;
        }
        const loadProductData = async () => {
            try {
                setPageLoading(true);
                const data = await fetchProductForEdit(productId);

                setName(data.name);
                setDescription(data.description || '');
                
                // Gán ảnh chính cũ vào preview
                if (data.image_url) {
                    setImagePreview(getImageUrl(data.image_url));
                }

                setShopCateId(data.shop_cate_id);
                setStatus(data.status);

                if (data.details && data.details.length > 0) {
                    setDetails(data.details);
                } else {
                    setDetails([{ key: '', value: '' }]);
                }

                if (data.variations && data.variations.length > 0) {
                    setHasVariation(true);
                    setSelectedAttributeId(data.attribute_id);
                    
                    // Gán dữ liệu biến thể (bao gồm ảnh cũ)
                    setVariations(data.variations.map((v: any) => ({
                        value: v.value,
                        price: v.price,
                        stock: v.stock,
                        image_url: v.image_url || '',
                        preview: v.image_url ? getImageUrl(v.image_url) : '' // Tạo preview từ ảnh cũ
                    })));
                } else {
                    setHasVariation(false);
                    setBasePrice(data.base_price || 0);
                    setBaseStock(data.stock || 0);
                }

            } catch (err: any) {
                setError(err.response?.data?.message || "Không thể tải dữ liệu sản phẩm.");
            } finally {
                setPageLoading(false);
            }
        };
        loadProductData();
    }, [productId]);

    // ===== 1. XỬ LÝ CHỌN ẢNH CHÍNH =====
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh!');
            if (file.size > 5 * 1024 * 1024) return alert('Ảnh quá lớn (Max 5MB)!');

            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    // ===== 2. XỬ LÝ CHỌN ẢNH BIẾN THỂ (MỚI) =====
    const handleVariationImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh!');
            if (file.size > 5 * 1024 * 1024) return alert('Ảnh quá lớn (Max 5MB)!');

            const objectUrl = URL.createObjectURL(file);
            
            const newVariations = [...variations];
            newVariations[index] = { 
                ...newVariations[index], 
                file: file, 
                preview: objectUrl 
            };
            setVariations(newVariations);
        }
    };
    // =========================================

    // Cleanup preview url
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            variations.forEach(v => {
                if (v.preview && v.preview.startsWith('blob:')) URL.revokeObjectURL(v.preview);
            });
        }
    }, [imagePreview, variations]);

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

    const handleDetailChange = (index: number, field: keyof DetailItem, value: string) => {
        const newDetails = [...details];
        newDetails[index][field] = value;
        setDetails(newDetails);
    };
    const handleAddDetail = () => {
        setDetails([...details, { key: '', value: '' }]);
    };
    const handleRemoveDetail = (index: number) => {
        if (details.length <= 1) {
            setDetails([{ key: '', value: '' }]);
            return;
        }
        const newDetails = details.filter((_, i) => i !== index);
        setDetails(newDetails);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) return;
        setLoading(true);
        setError('');

        const filteredDetails = details.filter(d => d.key.trim() !== '' && d.value.trim() !== '');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('status', status.toString());
            
            if (shopCateId) {
                formData.append('shop_cate_id', shopCateId.toString());
            } else {
                formData.append('shop_cate_id', 'null');
            }

            if (imageFile) {
                formData.append('product_image', imageFile);
            }

            if (filteredDetails.length > 0) {
                formData.append('details', JSON.stringify(filteredDetails));
            }

            if (hasVariation) {
                if (!selectedAttributeId) {
                    setError("Vui lòng chọn tên nhóm phân loại.");
                    setLoading(false);
                    return;
                }
                formData.append('attribute_id', selectedAttributeId.toString());
                
                // 1. Gửi JSON thông tin (LOẠI BỎ FILE KHỎI JSON)
                // QUAN TRỌNG: Với ảnh biến thể, nếu không có file mới, ta cần giữ lại image_url cũ
                const validVariations = variations.map(v => ({
                    value: v.value,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    image_url: v.image_url // Gửi lại URL cũ để backend biết giữ nguyên nếu không có file mới
                    // Không gửi 'file' hay 'preview' trong JSON này
                }));
                formData.append('variations', JSON.stringify(validVariations));

                // 2. Gửi CÁC FILE ẢNH BIẾN THỂ MỚI
                variations.forEach((v, index) => {
                    if (v.file) {
                        // Key: variation_image_0, variation_image_1 ...
                        formData.append(`variation_image_${index}`, v.file);
                    }
                });
            } else {
                formData.append('base_price', basePrice.toString());
                formData.append('stock', baseStock.toString());
            }

            await updateProduct(Number(productId), formData);
            
            setLoading(false);
            navigate('/seller/products');

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật sản phẩm.");
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container mt-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>Sửa sản phẩm</h3>
                    <div>
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/seller/products')}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Thông tin cơ bản */}
                <div className="card shadow-sm mb-3">
                    <div className="card-header">Thông tin cơ bản</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả sản phẩm</label>
                            <TiptapEditor value={description} onChange={setDescription} />
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Ảnh chính sản phẩm</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="mt-2 p-2 border rounded bg-light text-center">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            style={{maxHeight: '200px', maxWidth: '100%', objectFit: 'contain'}}
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image';
                                            }}
                                        />
                                    </div>
                                )}
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

                {/* Chi tiết sản phẩm */}
                <div className="card shadow-sm mb-3">
                    <div className="card-header">Chi tiết sản phẩm</div>
                    <div className="card-body">
                        {details.map((detail, index) => (
                             <div key={index} className="row align-items-center mb-2">
                                <div className="col-md-5">
                                    <input type="text" className="form-control" placeholder="Thuộc tính" value={detail.key} onChange={(e) => handleDetailChange(index, 'key', e.target.value)} />
                                </div>
                                <div className="col-md-5">
                                    <input type="text" className="form-control" placeholder="Giá trị" value={detail.value} onChange={(e) => handleDetailChange(index, 'value', e.target.value)} />
                                </div>
                                <div className="col-md-2">
                                    <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => handleRemoveDetail(index)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-link" onClick={handleAddDetail}>+ Thêm chi tiết</button>
                    </div>
                </div>

                {/* Thông tin bán hàng */}
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
                                        <option value="">-- Chọn thuộc tính --</option>
                                        {attributes.map(attr => (
                                            <option key={attr.id} value={attr.id}>{attr.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {variations.map((variation, index) => (
                                    <div key={index} className="row align-items-center mb-2 p-2 border rounded">
                                        <div className="col-md-3">
                                            <label className="form-label">Tên phân loại <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder="ví dụ: Đỏ" value={variation.value} onChange={(e) => handleVariationChange(index, 'value', e.target.value)} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">Giá <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" value={variation.price} onChange={(e) => handleVariationChange(index, 'price', Number(e.target.value))} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">Kho <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" value={variation.stock} onChange={(e) => handleVariationChange(index, 'stock', Number(e.target.value))} required />
                                        </div>
                                        
                                        {/* ===== INPUT FILE CHO BIẾN THỂ ===== */}
                                        <div className="col-md-4">
                                            <label className="form-label">Ảnh (Tùy chọn)</label>
                                            <div className="d-flex align-items-center gap-2">
                                                <input 
                                                    type="file" 
                                                    className="form-control form-control-sm" 
                                                    accept="image/*"
                                                    onChange={(e) => handleVariationImageChange(index, e)} 
                                                />
                                                {variation.preview && (
                                                    <img 
                                                        src={variation.preview} 
                                                        alt="Var" 
                                                        style={{height: '38px', width: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}} 
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/40?text=X';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {/* =================================== */}

                                        <div className="col-md-1 d-flex align-items-end">
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveVariation(index)} disabled={variations.length <= 1}>X</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-link" onClick={handleAddVariation}>+ Thêm phân loại</button>
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

                <div className="card shadow-sm mb-3">
                      <div className="card-header">Trạng thái đăng bán</div>
                      <div className="card-body">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="status" id="status1" value={1} checked={status === 1} onChange={() => setStatus(1)} />
                            <label className="form-check-label" htmlFor="status1">Hoạt động</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="status" id="status0" value={0} checked={status === 0} onChange={() => setStatus(0)} />
                            <label className="form-check-label" htmlFor="status0">Tạm dừng</label>
                        </div>
                      </div>
                </div>

                <div className="d-flex justify-content-end mb-5">
                    <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/seller/products')}>Hủy</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
}