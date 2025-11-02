import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext'; // (Context của bạn)
import type { CartItem } from '../types/CartType';
import { fecthProductsByID } from '../api/products';
import type { ProductType } from '../types/ProductType';

interface VariantEditModalProps {
    show: boolean; // Prop để Bật/Tắt modal
    onClose: () => void; // Hàm để Đóng modal
    cartItem: CartItem; // Sản phẩm đang sửa
}

export default function VariantEditModal({ show, onClose, cartItem }: VariantEditModalProps) {
    const { updateCartItem } = useCart(); // (Chúng ta sẽ tạo hàm này ở Bước 3)

    // State của riêng Modal
    const [fullProduct, setFullProduct] = useState<ProductType | null>(null);
    const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
    const [quantity, setQuantity] = useState(cartItem.quantity);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Tải toàn bộ thông tin sản phẩm (để có list biến thể) khi modal mở
    useEffect(() => {
        if (show) {
            setIsLoading(true);
            // Gọi API bạn đã có để lấy toàn bộ thông tin
            fecthProductsByID(cartItem.product_id.toString())
                .then(data => {
                    setFullProduct(data); // (Giả sử API trả về { product, attributes })
                    console.log(data);


                    // Set các tùy chọn ban đầu (ví dụ: "Màu sắc": "Hồng")
                    const initialOptions = {};
                    if (cartItem.options) cartItem.options.forEach((opt: any) => {
                        initialOptions[opt.attribute] = opt.value;
                    });
                    setSelectedAttrs(initialOptions);
                })
                .catch(err => console.error("Lỗi tải chi tiết sản phẩm:", err))
                .finally(() => setIsLoading(false));
        }
    }, [show, cartItem]); // Chạy lại khi modal mở

    // 2. Logic tìm biến thể (giống hệt trang sản phẩm)
    const currentVariant = useMemo(() => {
        if (!fullProduct || !selectedAttrs) return undefined;

        return fullProduct.product_variants?.find((variant: any) =>
            variant.options.every((option: any) =>
                selectedAttrs[option.attribute] === option.value
            )
        );
    }, [selectedAttrs, fullProduct]);

    const derivedAttributes = useMemo(() => {
        // Nếu chưa tải xong, trả về mảng rỗng
        if (!fullProduct || !fullProduct.product_variants) {
            return [];
        }

        // Dùng Map để gom nhóm các thuộc tính
        // (ví dụ: "Màu sắc" => Set("Hồng", "Cam", "Đỏ"))
        const attrMap = new Map<string, Set<string>>();

        // Lặp qua từng biến thể (variant)
        for (const variant of fullProduct.product_variants) {
            // Lặp qua từng tùy chọn (option) của biến thể đó
            for (const option of variant.options) {
                // option = { attribute: "Màu sắc", value: "Hồng" }

                // Nếu chưa thấy "Màu sắc", tạo một Set mới
                if (!attrMap.has(option.attribute)) {
                    attrMap.set(option.attribute, new Set());
                }
                // Thêm giá trị "Hồng" vào Set
                attrMap.get(option.attribute)?.add(option.value);
            }
        }

        // Chuyển Map thành mảng mà JSX cần
        // Ví dụ: [ { attribute: "Màu sắc", values: ["Hồng", "Cam", "Đỏ"] }, ... ]
        return Array.from(attrMap.entries()).map(([key, valueSet]) => ({
            attribute: key,
            values: Array.from(valueSet)
        }));

    }, [fullProduct]); // Chỉ tính toán lại khi 'fullProduct' thay đổi

    // 3. Hàm chọn
    const handleSelectAttribute = (attrName: string, val: string) => {
        setSelectedAttrs(prev => ({ ...prev, [attrName]: val }));
    };

    // 4. Hàm lưu
    const handleSaveChanges = () => {
        if (!currentVariant) {
            alert("Vui lòng chọn đầy đủ tùy chọn.");
            return;
        }

        // Gọi hàm context
        updateCartItem(cartItem.product_variant_id, currentVariant.id, quantity);
        onClose(); // Đóng modal
    };

    // 5. Giao diện (Dùng class của Bootstrap)
    return (
        <div
            className={`modal fade ${show ? 'show' : ''}`}
            style={{ display: show ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Sửa tùy chọn sản phẩm</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {isLoading && <div>Đang tải...</div>}

                        {/* Tái sử dụng logic/giao diện từ trang sản phẩm */}
                        {fullProduct && (
                            <>
                                {/* Tên sản phẩm */}
                                <h6 className="fw-bold">{fullProduct.name}</h6>

                                {/* Lặp qua các thuộc tính */}
                                {derivedAttributes.map((attr) => (
                                    <div key={attr.attribute} className="mb-3">
                                        <div className="fw-semibold">{attr.attribute}</div>
                                        <div className="d-flex align-items-center gap-2">
                                            {attr.values.map((val: any) => (
                                                <div
                                                    className={`rounded py-1 px-3 pointer ${selectedAttrs[attr.attribute] === val ? "border-product-attribute" : "bg-secondary-subtle"}`}
                                                    key={val}
                                                    onClick={() => handleSelectAttribute(attr.attribute, val)}
                                                >
                                                    {val}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Giá và Tồn kho (động) */}
                                <div className="mt-3">
                                    <div>Giá:
                                        <span className="fw-bold text-danger ms-2">
                                            {currentVariant ? currentVariant.price.toLocaleString() : '...'}đ
                                        </span>
                                    </div>
                                    <div>Tồn kho: {currentVariant ? currentVariant.stock : '...'}
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSaveChanges}
                            disabled={!currentVariant || isLoading || currentVariant.stock == 0} // Vô hiệu hóa nếu chưa chọn
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}