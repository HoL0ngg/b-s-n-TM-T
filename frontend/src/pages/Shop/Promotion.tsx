// src/pages/Shop/PromotionManagementPage.tsx
import { useState, useEffect } from 'react';
import type { ProductVariantType, PromotionItem, PromotionType } from '../../types/ProductType';
import { apiDeletePromotionItem, apiGetPromotionDetails, apiGetShopPromotions, apiSavePromotionDetails } from '../../api/products';
import DateRangeDisplay from '../../components/DateRangeDisplay';
import ProductPickerModal from '../../components/CreatePromotionModal';
import CreatePromotionModal from '../../components/CreatePromotionModal';

export default function Promotion() {

    // --- STATE ---
    // Cột 1: Danh sách tất cả sự kiện
    const [promotions, setPromotions] = useState<PromotionType[]>([]);

    // Cột 2: Sự kiện đang được chọn để sửa
    const [selectedPromo, setSelectedPromo] = useState<PromotionType | null>(null);

    // Cột 2: Danh sách sản phẩm thuộc sự kiện đang chọn
    const [promoItems, setPromoItems] = useState<PromotionItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- EFFECTS ---
    // Tải danh sách sự kiện (cột 1) khi vào trang
    useEffect(() => {
        apiGetShopPromotions().then(setPromotions);
    }, []);

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
        // 1. Chuyển chuỗi thành số (tránh lỗi NaN nếu chuỗi rỗng)
        const newValue = newValueString === '' ? 0 : Number(newValueString);
        setPromoItems(currentItems =>
            currentItems.map(item =>
                item.product_variant_id === variantId
                    // 2. Cập nhật đúng trường 'discount_value'
                    ? { ...item, discount_value: newValue }
                    : item
            )
        );
    };

    // Hàm gọi API (Nút "Lưu thay đổi")
    const handleSaveChanges = async () => {
        if (!selectedPromo) return;

        try {
            // Gửi toàn bộ danh sách 'promoItems' mới lên backend
            await apiSavePromotionDetails(selectedPromo.id, promoItems);
            alert("Đã lưu thay đổi!");
            setSelectedPromo(null);
        } catch (error) {
            alert("Lỗi! Không thể lưu.");
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false); // Đóng modal
        // fetchPromotions(); // Tải lại danh sách (để thấy event mới)
    };

    const handleDeleteItem = async (variantId: number) => {
        if (!selectedPromo || !window.confirm("Bạn chắc chắn muốn xóa?")) return;
        console.log(variantId);


        try {
            // Gọi API xóa ngay lập tức
            await apiDeletePromotionItem(selectedPromo.id, variantId);

            // Cập nhật UI (xóa khỏi state promoItems)
            setPromoItems(current => current.filter(item => item.product_variant_id !== variantId));

        } catch (error) {
            alert("Lỗi khi xóa sản phẩm.");
        }
    };

    // Hàm này được gọi khi Modal 'ProductPicker' trả về sản phẩm
    const handleAddProducts = (selectedVariants: ProductVariantType[]) => {
        const newItems: PromotionItem[] = selectedVariants.map(variant => ({
            promotion_id: selectedPromo!.id,
            product_variant_id: variant.id,
            discount_value: 10, // Mặc định 10%
            // (Bạn cũng cần JOIN để lấy tên/ảnh sản phẩm)
            original_price: variant.original_price,
            stock: variant.stock,
            product_name: variant.product_name || '',
            product_image: variant.image_url,
        }));

        // Thêm vào state (loại bỏ trùng lặp nếu có)
        setPromoItems(current => [...current, ...newItems.filter(
            newItem => !current.some(c => c.product_variant_id === newItem.product_variant_id)
        )]);

        setIsProductPickerOpen(false);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                {/* --- CỘT 1: DANH SÁCH SỰ KIỆN --- */}
                <div className="col-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4>Sự kiện giảm giá</h4>
                        <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>Tạo mới</button>
                    </div>
                    <div className="list-group">
                        {promotions ? promotions.map(promo => (
                            <button
                                key={promo.id}
                                className={`list-group-item list-group-item-action ${selectedPromo?.id === promo.id ? '' : ''}`}
                                onClick={() => setSelectedPromo(promo)}
                            >
                                {promo.name}
                                <br />
                                <DateRangeDisplay
                                    startDate={promo.start_date}
                                    endDate={promo.end_date}
                                />
                            </button>
                        )) : (<div>Chưa có sự kiện b ei</div>)}
                    </div>
                </div>

                {/* --- CỘT 2: CHI TIẾT SỰ KIỆN --- */}
                <div className="col-md-8">
                    {selectedPromo && (
                        <div className="card">
                            <div className="card-header">
                                <h5>Chi tiết: {selectedPromo.name}</h5>
                                {/* (Bạn có thể thêm input sửa tên, ngày ở đây) */}
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <strong>Sản phẩm áp dụng</strong>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        + Thêm sản phẩm
                                    </button>
                                </div>

                                {isLoading ? <div>Đang tải...</div> : (
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Giảm giá</th>
                                                <th>Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {promoItems.map(item => (
                                                <tr key={item.product_variant_id}>
                                                    <td>{item.product_name}
                                                        <small className='ms-4'>{item.options_string}</small>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm w-100"
                                                            value={item.discount_value}
                                                            onChange={(e) => handleDiscountChange(item.product_variant_id, e.target.value)}
                                                            min={0}
                                                            max={100} // Giới hạn từ 0% đến 100
                                                        />
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item.product_variant_id)}>X</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="card-footer text-end">
                                <button className="btn btn-success" onClick={handleSaveChanges}>
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CreatePromotionModal
                show={isCreateModalOpen}
                onHide={() => setIsCreateModalOpen(false)}
                onSaveSuccess={handleCreateSuccess} // <-- SỬA THÀNH 'onSave'
            />
        </div>
    );
}