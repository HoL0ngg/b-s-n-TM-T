import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchShopCategories } from '../../api/shopCategory';
import type { ShopCategoryType } from '../../api/shopCategory';
import { fetchProductAttributes, createProduct } from '../../api/products';
import type { AttributeType } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import TiptapEditor from '../../components/TipTapEditor';

// Type cho biến thể cuối cùng gửi đi
interface FinalVariation {
    value1: string; // Giá trị cấp 1 (vd: Đỏ)
    value2?: string; // Giá trị cấp 2 (vd: XL)
    price: number;
    stock: number;
    image_url?: string;
    file?: File;      
    preview?: string; 
}

interface DetailItem { key: string; value: string; }

export default function AddProduct() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shopId, setShopId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data tĩnh
    const [shopCategories, setShopCategories] = useState<ShopCategoryType[]>([]);
    const [attributes, setAttributes] = useState<AttributeType[]>([]);

    // Form cơ bản
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [shopCateId, setShopCateId] = useState<number | null>(null);
    const [status, setStatus] = useState(1);

    // ===== LOGIC PHÂN LOẠI 2 CẤP (Shopee Style) =====
    const [hasVariation, setHasVariation] = useState(false);
    
    // Cấp 1 (Ví dụ: Màu sắc)
    const [tier1Id, setTier1Id] = useState<number | null>(null);
    const [tier1Input, setTier1Input] = useState(''); // Input tạm
    const [tier1Values, setTier1Values] = useState<string[]>([]); // Danh sách: [Đỏ, Xanh]

    // Cấp 2 (Ví dụ: Size)
    const [tier2Id, setTier2Id] = useState<number | null>(null);
    const [tier2Input, setTier2Input] = useState('');
    const [tier2Values, setTier2Values] = useState<string[]>([]); // Danh sách: [S, M]

    // Bảng kết quả biến thể (Cartesian Product)
    const [variations, setVariations] = useState<FinalVariation[]>([]);
    
    // =================================================

    const [basePrice, setBasePrice] = useState(0);
    const [baseStock, setBaseStock] = useState(0);
    const [details, setDetails] = useState<DetailItem[]>([{ key: '', value: '' }]);

    useEffect(() => {
        const fetchShopId = async () => {
            if (!user?.id) return;
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${baseUrl}/api/shops/by-owner/${user.id}`);
                const shopData = await response.json();
                if (shopData && shopData.id) setShopId(shopData.id);
            } catch (e) { console.error(e); }
        };
        const loadData = async () => {
            const [cats, attrs] = await Promise.all([fetchShopCategories(), fetchProductAttributes()]);
            setShopCategories(cats || []);
            setAttributes(attrs || []);
        };
        fetchShopId();
        loadData();
    }, [user]);

    // --- XỬ LÝ ẢNH CHÍNH ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- LOGIC TẠO BẢNG BIẾN THỂ (TỰ ĐỘNG) ---
    useEffect(() => {
        if (!hasVariation) return;

        // Tạo tổ hợp: (List 1) x (List 2)
        const newVariations: FinalVariation[] = [];

        if (tier1Values.length > 0) {
            tier1Values.forEach(v1 => {
                if (tier2Values.length > 0) {
                    // Nếu có cả cấp 2 -> Tạo tổ hợp (Đỏ-S, Đỏ-M...)
                    tier2Values.forEach(v2 => {
                        // Tìm xem biến thể này đã có dữ liệu cũ chưa (để giữ lại giá/kho/ảnh)
                        const existing = variations.find(v => v.value1 === v1 && v.value2 === v2);
                        newVariations.push({
                            value1: v1,
                            value2: v2,
                            price: existing ? existing.price : 0,
                            stock: existing ? existing.stock : 0,
                            file: existing?.file,
                            preview: existing?.preview
                        });
                    });
                } else {
                    // Nếu chỉ có cấp 1
                    const existing = variations.find(v => v.value1 === v1 && !v.value2);
                    newVariations.push({
                        value1: v1,
                        price: existing ? existing.price : 0,
                        stock: existing ? existing.stock : 0,
                        file: existing?.file,
                        preview: existing?.preview
                    });
                }
            });
        }
        // Chỉ update nếu số lượng thay đổi (để tránh loop vô tận, logic đơn giản)
        // Ở đây ta set luôn để cập nhật realtime
        setVariations(newVariations);
    }, [tier1Values, tier2Values, hasVariation]); // Chạy lại khi danh sách giá trị thay đổi

    // Hàm thêm giá trị vào danh sách (khi nhấn Enter hoặc nút Thêm)
    const addValue = (tier: 1 | 2) => {
        if (tier === 1) {
            if (tier1Input.trim() && !tier1Values.includes(tier1Input.trim())) {
                setTier1Values([...tier1Values, tier1Input.trim()]);
                setTier1Input('');
            }
        } else {
            if (tier2Input.trim() && !tier2Values.includes(tier2Input.trim())) {
                setTier2Values([...tier2Values, tier2Input.trim()]);
                setTier2Input('');
            }
        }
    };
    
    // Hàm xóa giá trị
    const removeValue = (tier: 1 | 2, val: string) => {
        if (tier === 1) setTier1Values(tier1Values.filter(v => v !== val));
        else setTier2Values(tier2Values.filter(v => v !== val));
    };

    // Cập nhật thông tin từng dòng biến thể (Giá, Kho)
    const updateVariationRow = (index: number, field: keyof FinalVariation, val: any) => {
        const updated = [...variations];
        (updated[index] as any)[field] = val;
        setVariations(updated);
    };

    // Upload ảnh cho biến thể (Chỉ cho phép ở cấp 1 đại diện, hoặc từng dòng tùy bạn)
    // Ở đây tôi làm cho từng dòng trong bảng
    const handleVarImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const updated = [...variations];
            updated[index].file = file;
            updated[index].preview = URL.createObjectURL(file);
            setVariations(updated);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId) return alert("Lỗi Shop ID");
        
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('shop_cate_id', shopCateId ? shopCateId.toString() : '');
            formData.append('status', status.toString());
            if (imageFile) formData.append('product_image', imageFile);

            if (details[0].key) formData.append('details', JSON.stringify(details));

            if (hasVariation) {
                if (!tier1Id) return alert("Vui lòng chọn Nhóm phân loại 1");
                formData.append('attribute1_id', tier1Id.toString());
                if (tier2Id) formData.append('attribute2_id', tier2Id.toString());

                // Gửi JSON danh sách (trừ file)
                const jsonVars = variations.map(v => ({
                    value1: v.value1,
                    value2: v.value2, // Có thể undefined
                    price: v.price,
                    stock: v.stock
                }));
                formData.append('variations', JSON.stringify(jsonVars));

                // Gửi File ảnh
                variations.forEach((v, idx) => {
                    if (v.file) formData.append(`variation_image_${idx}`, v.file);
                });
            } else {
                formData.append('base_price', basePrice.toString());
                formData.append('stock', baseStock.toString());
            }

            await createProduct(formData);
            navigate('/seller/products');
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi tạo sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: '1000px' }}>
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between mb-3">
                    <h3>Thêm sản phẩm mới</h3>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Đang lưu..." : "Lưu & Đăng bán"}
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* 1. THÔNG TIN CƠ BẢN */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header fw-bold">Thông tin cơ bản</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Tên sản phẩm *</label>
                            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <TiptapEditor value={description} onChange={setDescription} />
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label">Ảnh bìa *</label>
                                <input type="file" className="form-control" onChange={handleImageChange} />
                                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2" style={{height: 100}} />}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Danh mục</label>
                                <select className="form-select" value={shopCateId || ''} onChange={e => setShopCateId(Number(e.target.value))}>
                                    <option value="">-- Chọn --</option>
                                    {shopCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PHÂN LOẠI HÀNG (2 CẤP) */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header d-flex justify-content-between">
                        <span className="fw-bold">Thông tin bán hàng</span>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" checked={hasVariation} onChange={e => setHasVariation(e.target.checked)} />
                            <label className="form-check-label">Bật phân loại hàng</label>
                        </div>
                    </div>
                    <div className="card-body">
                        {!hasVariation ? (
                            <div className="row">
                                <div className="col-md-6">
                                    <label>Giá bán *</label>
                                    <input type="number" className="form-control" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} />
                                </div>
                                <div className="col-md-6">
                                    <label>Kho hàng *</label>
                                    <input type="number" className="form-control" value={baseStock} onChange={e => setBaseStock(Number(e.target.value))} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* NHÓM PHÂN LOẠI 1 */}
                                <div className="mb-4 p-3 bg-light rounded">
                                    <div className="row mb-2">
                                        <div className="col-md-4">
                                            <label>Nhóm phân loại 1 (vd: Màu sắc)</label>
                                            <select className="form-select" value={tier1Id || ''} onChange={e => setTier1Id(Number(e.target.value))}>
                                                <option value="">-- Chọn --</option>
                                                {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-8">
                                            <label>Giá trị (Nhấn Enter để thêm)</label>
                                            <div className="d-flex gap-2">
                                                <input 
                                                    type="text" className="form-control" placeholder="vd: Đỏ, Xanh..." 
                                                    value={tier1Input} onChange={e => setTier1Input(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addValue(1))}
                                                />
                                                <button type="button" className="btn btn-secondary" onClick={() => addValue(1)}>Thêm</button>
                                            </div>
                                            <div className="mt-2 d-flex flex-wrap gap-2">
                                                {tier1Values.map(v => (
                                                    <span key={v} className="badge bg-primary d-flex align-items-center gap-2 p-2">
                                                        {v} <i className="bi bi-x-circle cursor-pointer" onClick={() => removeValue(1, v)} style={{cursor:'pointer'}}></i>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NHÓM PHÂN LOẠI 2 */}
                                {tier1Values.length > 0 && (
                                    <div className="mb-4 p-3 bg-light rounded">
                                        <div className="row mb-2">
                                            <div className="col-md-4">
                                                <label>Nhóm phân loại 2 (vd: Size) - Tùy chọn</label>
                                                <select className="form-select" value={tier2Id || ''} onChange={e => setTier2Id(Number(e.target.value))}>
                                                    <option value="">-- Không chọn --</option>
                                                    {attributes.filter(a => a.id !== tier1Id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                            {tier2Id && (
                                                <div className="col-md-8">
                                                    <label>Giá trị (Nhấn Enter để thêm)</label>
                                                    <div className="d-flex gap-2">
                                                        <input 
                                                            type="text" className="form-control" placeholder="vd: S, M, L..." 
                                                            value={tier2Input} onChange={e => setTier2Input(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addValue(2))}
                                                        />
                                                        <button type="button" className="btn btn-secondary" onClick={() => addValue(2)}>Thêm</button>
                                                    </div>
                                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                                        {tier2Values.map(v => (
                                                            <span key={v} className="badge bg-info text-dark d-flex align-items-center gap-2 p-2">
                                                                {v} <i className="bi bi-x-circle cursor-pointer" onClick={() => removeValue(2, v)} style={{cursor:'pointer'}}></i>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* BẢNG DANH SÁCH BIẾN THỂ */}
                                {variations.length > 0 && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered text-center align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>{attributes.find(a => a.id === tier1Id)?.name || 'Nhóm 1'}</th>
                                                    {tier2Id && <th>{attributes.find(a => a.id === tier2Id)?.name || 'Nhóm 2'}</th>}
                                                    <th style={{width: '120px'}}>Giá *</th>
                                                    <th style={{width: '100px'}}>Kho *</th>
                                                    <th>Ảnh (Tùy chọn)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variations.map((v, idx) => (
                                                    <tr key={idx}>
                                                        <td>{v.value1}</td>
                                                        {tier2Id && <td>{v.value2}</td>}
                                                        <td>
                                                            <input type="number" className="form-control" value={v.price} onChange={e => updateVariationRow(idx, 'price', Number(e.target.value))} />
                                                        </td>
                                                        <td>
                                                            <input type="number" className="form-control" value={v.stock} onChange={e => updateVariationRow(idx, 'stock', Number(e.target.value))} />
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                                <input type="file" className="form-control form-control-sm" style={{width: '90px'}} onChange={e => handleVarImage(idx, e)} />
                                                                {v.preview && <img src={v.preview} style={{width: 30, height: 30}} alt="v" />}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. CHI TIẾT KHÁC */}
                <div className="card shadow-sm mb-3">
                    <div className="card-header">Chi tiết khác</div>
                    <div className="card-body">
                        {details.map((d, i) => (
                            <div key={i} className="row mb-2">
                                <div className="col-5"><input className="form-control" placeholder="Thuộc tính" value={d.key} onChange={e => {const n=[...details]; n[i].key=e.target.value; setDetails(n)}}/></div>
                                <div className="col-5"><input className="form-control" placeholder="Giá trị" value={d.value} onChange={e => {const n=[...details]; n[i].value=e.target.value; setDetails(n)}}/></div>
                                <div className="col-2"><button type="button" className="btn btn-outline-danger w-100" onClick={() => {if(details.length>1) setDetails(details.filter((_,idx)=>idx!==i))}}>Xóa</button></div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-link" onClick={() => setDetails([...details, {key:'', value:''}])}>+ Thêm</button>
                    </div>
                </div>
            </form>
        </div>
    );
}