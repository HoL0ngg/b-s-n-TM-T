import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchShopCategories } from '../../api/shopCategory';
import type { ShopCategoryType } from '../../api/shopCategory';
import { fetchProductAttributes, updateProduct, fetchProductForEdit } from '../../api/products';
import type { AttributeType } from '../../api/products';
import TiptapEditor from '../../components/TipTapEditor';
import { useAuth } from '../../context/AuthContext'; 

// Interface giống AddProduct
interface FinalVariation {
    value1: string; 
    value2?: string; 
    price: number;
    stock: number;
    image_url?: string;
    file?: File;      
    preview?: string; 
}
interface DetailItem { key: string; value: string; }

export default function EditProduct() {
    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { } = useAuth();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [shopCategories, setShopCategories] = useState<ShopCategoryType[]>([]);
    const [attributes, setAttributes] = useState<AttributeType[]>([]);

    // Form cơ bản
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [imagePreview, setImagePreview] = useState<string>('');   
    const [shopCateId, setShopCateId] = useState<number | null>(null);
    const [status, setStatus] = useState(1);

    // ===== LOGIC PHÂN LOẠI 2 CẤP (Edit Mode) =====
    const [hasVariation, setHasVariation] = useState(false);
    
    const [tier1Id, setTier1Id] = useState<number | null>(null);
    const [tier1Input, setTier1Input] = useState('');
    const [tier1Values, setTier1Values] = useState<string[]>([]);

    const [tier2Id, setTier2Id] = useState<number | null>(null);
    const [tier2Input, setTier2Input] = useState('');
    const [tier2Values, setTier2Values] = useState<string[]>([]);

    const [variations, setVariations] = useState<FinalVariation[]>([]);
    // =============================================

    const [basePrice, setBasePrice] = useState(0);
    const [baseStock, setBaseStock] = useState(0);
    const [details, setDetails] = useState<DetailItem[]>([{ key: '', value: '' }]);

    // Hàm xử lý URL (Đã fix VITE_API_URL)
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
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

    // ===== LOGIC QUAN TRỌNG: LOAD DỮ LIỆU CŨ VÀO FORM 2 CẤP =====
    useEffect(() => {
        if (!productId) return;
        const loadProductData = async () => {
            try {
                setPageLoading(true);
                const data = await fetchProductForEdit(productId);

                setName(data.name);
                setDescription(data.description || '');
                if (data.image_url) setImagePreview(getImageUrl(data.image_url));
                setShopCateId(data.shop_cate_id);
                setStatus(data.status);

                if (data.details && data.details.length > 0) setDetails(data.details);
                else setDetails([{ key: '', value: '' }]);

                // Xử lý Biến thể (Mapping dữ liệu cũ vào State 2 cấp)
                if (data.variations && data.variations.length > 0) {
                    setHasVariation(true);
                    
                    // 1. Tìm ra các Attribute ID và Values từ dữ liệu trả về
                    // Giả sử Backend trả về variations có cấu trúc chứa options (attribute_id, value)
                    // Hoặc nếu dữ liệu cũ chỉ có 1 cấp, ta cố gắng map nó.
                    
                    // Logic: Lấy tất cả variations, phân tích xem chúng thuộc attribute nào
                    // Lưu ý: Logic này phụ thuộc vào việc API trả về variation có chứa info về attribute
                    // Nếu API trả về trường 'options' là mảng [{attribute_id, value}, ...]
                    
                    const vList = data.variations;
                    const firstVar = vList[0];
                    
                    // Case 1: Dữ liệu cũ 1 cấp (dựa trên attribute_id của product)
                    if (data.attribute_id && !firstVar.options) {
                        setTier1Id(data.attribute_id);
                        const values = vList.map((v:any) => v.value);
                        setTier1Values([...new Set(values)] as string[]);
                        
                        setVariations(vList.map((v:any) => ({
                            value1: v.value,
                            price: v.price,
                            stock: v.stock,
                            image_url: v.image_url,
                            preview: v.image_url ? getImageUrl(v.image_url) : ''
                        })));
                    } 
                    // Case 2: Dữ liệu mới 2 cấp (Backend cần trả về options cho mỗi variant)
                    else if (firstVar.options) {
                        // Tìm attribute ID cho cấp 1 và 2
                        const attrIds = new Set<number>();
                        vList.forEach((v:any) => v.options.forEach((o:any) => attrIds.add(o.attribute_id)));
                        const attrsArray = Array.from(attrIds);

                        if (attrsArray.length > 0) setTier1Id(attrsArray[0]);
                        if (attrsArray.length > 1) setTier2Id(attrsArray[1]);

                        // Trích xuất Values
                        const vals1 = new Set<string>();
                        const vals2 = new Set<string>();

                        const mappedVars = vList.map((v:any) => {
                            const opt1 = v.options.find((o:any) => o.attribute_id === attrsArray[0]);
                            const opt2 = v.options.find((o:any) => o.attribute_id === attrsArray[1]);
                            
                            if(opt1) vals1.add(opt1.value);
                            if(opt2) vals2.add(opt2.value);

                            return {
                                value1: opt1 ? opt1.value : '',
                                value2: opt2 ? opt2.value : undefined,
                                price: v.price,
                                stock: v.stock,
                                image_url: v.image_url,
                                preview: v.image_url ? getImageUrl(v.image_url) : ''
                            };
                        });

                        setTier1Values(Array.from(vals1));
                        setTier2Values(Array.from(vals2));
                        setVariations(mappedVars);
                    }

                } else {
                    setHasVariation(false);
                    setBasePrice(data.base_price || 0);
                    setBaseStock(data.stock || 0);
                }

            } catch (err: any) {
                setError(err.response?.data?.message || "Lỗi tải dữ liệu.");
            } finally {
                setPageLoading(false);
            }
        };
        loadProductData();
    }, [productId]);

    // --- CÁC HÀM XỬ LÝ (GIỐNG ADD PRODUCT) ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Logic tạo bảng biến thể (Khi thêm/bớt giá trị)
    useEffect(() => {
        if (!hasVariation || pageLoading) return; // Không chạy khi đang load ban đầu

        // Logic này chỉ chạy khi người dùng THAY ĐỔI giá trị phân loại
        // Chúng ta cần merge với dữ liệu variations hiện có để không mất giá tiền/kho
        
        const newVariations: FinalVariation[] = [];
        if (tier1Values.length > 0) {
            tier1Values.forEach(v1 => {
                if (tier2Values.length > 0) {
                    tier2Values.forEach(v2 => {
                        const existing = variations.find(v => v.value1 === v1 && v.value2 === v2);
                        newVariations.push({
                            value1: v1, value2: v2,
                            price: existing ? existing.price : 0,
                            stock: existing ? existing.stock : 0,
                            image_url: existing?.image_url, // Giữ link ảnh cũ
                            file: existing?.file,
                            preview: existing?.preview || (existing?.image_url ? getImageUrl(existing.image_url) : '')
                        });
                    });
                } else {
                    const existing = variations.find(v => v.value1 === v1 && !v.value2);
                    newVariations.push({
                        value1: v1,
                        price: existing ? existing.price : 0,
                        stock: existing ? existing.stock : 0,
                        image_url: existing?.image_url,
                        file: existing?.file,
                        preview: existing?.preview || (existing?.image_url ? getImageUrl(existing.image_url) : '')
                    });
                }
            });
        }
        // Chỉ update nếu danh sách thực sự thay đổi về số lượng (để tránh loop với useEffect load data)
        // Tuy nhiên trong React strict mode cần cẩn thận. 
        // Ở đây ta chấp nhận render lại để đảm bảo bảng luôn đúng.
        if (newVariations.length !== variations.length || !newVariations.every((v, i) => v.value1 === variations[i]?.value1 && v.value2 === variations[i]?.value2)) {
             setVariations(newVariations);
        }
    }, [tier1Values, tier2Values, hasVariation]); 

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
    const removeValue = (tier: 1 | 2, val: string) => {
        if (tier === 1) setTier1Values(tier1Values.filter(v => v !== val));
        else setTier2Values(tier2Values.filter(v => v !== val));
    };
    const updateVariationRow = (index: number, field: keyof FinalVariation, val: any) => {
        const updated = [...variations];
        (updated[index] as any)[field] = val;
        setVariations(updated);
    };
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
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('status', status.toString());
            if (shopCateId) formData.append('shop_cate_id', shopCateId.toString());
            else formData.append('shop_cate_id', 'null');

            if (imageFile) formData.append('product_image', imageFile);

            const filteredDetails = details.filter(d => d.key.trim() !== '' && d.value.trim() !== '');
            if (filteredDetails.length > 0) formData.append('details', JSON.stringify(filteredDetails));

            if (hasVariation) {
                if (!tier1Id) { setError("Vui lòng chọn Nhóm phân loại 1"); setLoading(false); return; }
                formData.append('attribute1_id', tier1Id.toString());
                if (tier2Id) formData.append('attribute2_id', tier2Id.toString());

                // Gửi JSON (Gửi lại image_url cũ để backend biết giữ nguyên nếu ko có file mới)
                const jsonVars = variations.map(v => ({
                    value1: v.value1,
                    value2: v.value2,
                    price: v.price,
                    stock: v.stock,
                    image_url: v.image_url // Quan trọng: Gửi lại link cũ
                }));
                formData.append('variations', JSON.stringify(jsonVars));

                variations.forEach((v, idx) => {
                    if (v.file) formData.append(`variation_image_${idx}`, v.file);
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
            setError(err.response?.data?.message || "Lỗi cập nhật sản phẩm.");
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: '1000px' }}>
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between mb-3">
                    <h3>Sửa sản phẩm</h3>
                    <div>
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/seller/products')}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                        </button>
                    </div>
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
                                <label className="form-label">Ảnh chính *</label>
                                <input type="file" className="form-control" onChange={handleImageChange} />
                                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2" style={{height: 100, objectFit: 'contain'}} />}
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
                                {/* NHÓM 1 */}
                                <div className="mb-4 p-3 bg-light rounded">
                                    <div className="row mb-2">
                                        <div className="col-md-4">
                                            <label>Nhóm phân loại 1</label>
                                            <select className="form-select" value={tier1Id || ''} onChange={e => setTier1Id(Number(e.target.value))}>
                                                <option value="">-- Chọn --</option>
                                                {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-8">
                                            <label>Giá trị</label>
                                            <div className="d-flex gap-2">
                                                <input 
                                                    type="text" className="form-control" placeholder="vd: Đỏ..." 
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

                                {/* NHÓM 2 */}
                                {tier1Values.length > 0 && (
                                    <div className="mb-4 p-3 bg-light rounded">
                                        <div className="row mb-2">
                                            <div className="col-md-4">
                                                <label>Nhóm phân loại 2 (Tùy chọn)</label>
                                                <select className="form-select" value={tier2Id || ''} onChange={e => setTier2Id(Number(e.target.value))}>
                                                    <option value="">-- Không chọn --</option>
                                                    {attributes.filter(a => a.id !== tier1Id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                            {tier2Id && (
                                                <div className="col-md-8">
                                                    <label>Giá trị</label>
                                                    <div className="d-flex gap-2">
                                                        <input 
                                                            type="text" className="form-control" placeholder="vd: S, M..." 
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
                                                    <th>Ảnh</th>
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
                                                                {v.preview && <img src={v.preview} style={{width: 30, height: 30, objectFit: 'cover'}} alt="v" />}
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

                {/* 3. CHI TIẾT KHÁC & TRẠNG THÁI (Giữ nguyên logic) */}
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

                <div className="card shadow-sm mb-3">
                      <div className="card-header">Trạng thái</div>
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