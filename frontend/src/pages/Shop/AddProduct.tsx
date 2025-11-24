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
    file?: File;      
    preview?: string; 
}

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

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

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

    // ===== THÊM HÀM XỬ LÝ URL CHO CHẮC CHẮN =====
    // (Dù AddProduct chủ yếu dùng Blob, nhưng thêm vào để đồng bộ logic)
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };
    // ============================================

    useEffect(() => {
        const fetchShopId = async () => {
            if (!user?.id) return;
            try {
                // Sửa: Dùng biến môi trường thay vì template string phức tạp
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${baseUrl}/api/shops/by-owner/${user.id}`);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Ảnh quá lớn (Max 5MB)!');
                return;
            }
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleVariationImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Ảnh quá lớn (Max 5MB)!');
                return;
            }

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

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            variations.forEach(v => {
                if (v.preview) URL.revokeObjectURL(v.preview);
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
        if (!shopId) {
            setError("Lỗi: Không tìm thấy ID của shop.");
            return;
        }
        if (!name.trim()) {
            setError("Tên sản phẩm là bắt buộc");
            return;
        }
        if (!imageFile) {
            setError("Vui lòng chọn ảnh chính cho sản phẩm");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('shop_cate_id', shopCateId ? shopCateId.toString() : '');
            formData.append('status', status.toString());
            formData.append('product_image', imageFile);

            const filteredDetails = details.filter(d => d.key.trim() !== '' && d.value.trim() !== '');
            if (filteredDetails.length > 0) {
                formData.append('details', JSON.stringify(filteredDetails));
            }

            if (hasVariation) {
                if (!selectedAttributeId) {
                    setError("Vui lòng chọn tên nhóm phân loại (ví dụ: Màu sắc).");
                    setLoading(false);
                    return;
                }
                formData.append('attribute_id', selectedAttributeId.toString());

                const validVariations = variations.map(v => ({
                    value: v.value,
                    price: Number(v.price),
                    stock: Number(v.stock)
                }));
                formData.append('variations', JSON.stringify(validVariations));

                variations.forEach((v, index) => {
                    if (v.file) {
                        formData.append(`variation_image_${index}`, v.file);
                    }
                });
            } else {
                formData.append('base_price', basePrice.toString());
                formData.append('stock', baseStock.toString());
            }

            await createProduct(formData);

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
                                <label className="form-label">Ảnh chính sản phẩm <span className="text-danger">*</span></label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="mt-2 p-2 border rounded bg-light text-center">
                                        {/* SỬA THẺ IMG PREVIEW CHÍNH */}
                                        <img 
                                            src={imagePreview} 
                                            alt="Xem trước" 
                                            style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999' dominant-baseline='middle' text-anchor='middle'%3EImage Error%3C/text%3E%3C/svg%3E";
                                                target.onerror = null;
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
                                        <div className="col-md-2">
                                            <label className="form-label">Giá <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" value={variation.price} onChange={(e) => handleVariationChange(index, 'price', Number(e.target.value))} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">Kho <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" value={variation.stock} onChange={(e) => handleVariationChange(index, 'stock', Number(e.target.value))} required />
                                        </div>

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
                                                    // SỬA THẺ IMG PREVIEW BIẾN THỂ
                                                    <img 
                                                        src={variation.preview} 
                                                        alt="Var" 
                                                        style={{ height: '38px', width: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='10' fill='%23999' dominant-baseline='middle' text-anchor='middle'%3EX%3C/text%3E%3C/svg%3E";
                                                            target.onerror = null;
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-1 d-flex align-items-end">
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveVariation(index)} disabled={variations.length <= 1}>Xóa</button>
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