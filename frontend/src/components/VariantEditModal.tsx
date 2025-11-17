import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext'; 
import type { CartItem } from '../types/CartType';
import { fetchProductsByID } from '../api/products'; 
import type { ProductType } from '../types/ProductType';

interface VariantEditModalProps {
    show: boolean; 
    onClose: () => void; 
    cartItem: CartItem; 
}

export default function VariantEditModal({ show, onClose, cartItem }: VariantEditModalProps) {
    const { updateCartItem } = useCart(); 

    const [fullProduct, setFullProduct] = useState<ProductType | null>(null);
    const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
    
    const [quantity, setQuantity] = useState(cartItem.quantity); 
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setIsLoading(true);
            setQuantity(cartItem.quantity); 
            
            fetchProductsByID(cartItem.product_id.toString())
                .then(data => {
                    setFullProduct(data);
                    console.log(data);

                    const initialOptions: { [key: string]: string } = {};
                    if (cartItem.options) cartItem.options.forEach((opt: any) => {
                        initialOptions[opt.attribute] = opt.value; 
                    });
                    setSelectedAttrs(initialOptions);
                })
                .catch(err => console.error("Lỗi tải chi tiết sản phẩm:", err))
                .finally(() => setIsLoading(false));
        }
    }, [show, cartItem]); 

    const currentVariant = useMemo(() => {
        if (!fullProduct || !selectedAttrs) return undefined;

        return fullProduct.product_variants?.find((variant: any) =>
            variant.options.every((option: any) =>
                selectedAttrs[option.attribute] === option.value
            )
        );
    }, [selectedAttrs, fullProduct]);

    const derivedAttributes = useMemo(() => {
        if (!fullProduct || !fullProduct.product_variants) {
            return [];
        }
        const attrMap = new Map<string, Set<string>>();
        for (const variant of fullProduct.product_variants) {
            for (const option of variant.options) {
                if (!attrMap.has(option.attribute)) {
                    attrMap.set(option.attribute, new Set());
                }
                attrMap.get(option.attribute)?.add(option.value);
            }
        }
        return Array.from(attrMap.entries()).map(([key, valueSet]) => ({
            attribute: key,
            values: Array.from(valueSet)
        }));
    }, [fullProduct]); 

    const handleSelectAttribute = (attrName: string, val: string) => {
        setSelectedAttrs(prev => ({ ...prev, [attrName]: val }));
    };

    const handleQuantityChange = (amount: number) => {
        setQuantity(prevQty => {
            const newQty = prevQty + amount;
            const stock = currentVariant?.stock ?? 0;
            if (newQty < 1) return 1; 
            if (newQty > stock) return stock; 
            return newQty;
        });
    };

    const handleSaveChanges = () => {
        if (!currentVariant) {
            alert("Vui lòng chọn đầy đủ tùy chọn.");
            return;
        }
        if (quantity > currentVariant.stock) {
             alert(`Số lượng vượt quá tồn kho (Tồn kho: ${currentVariant.stock})`);
             setQuantity(currentVariant.stock); 
             return;
        }

        updateCartItem(cartItem.product_variant_id, currentVariant.id, quantity);
        onClose(); 
    };

    const stock = currentVariant?.stock ?? 0;

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

                        {fullProduct && (
                            <>
                                <h6 className="fw-bold">{fullProduct.name}</h6>

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

                                <div className="mb-3">
                                    <div className="fw-semibold">Số lượng</div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <button 
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        > - </button>
                                        
                                        <input 
                                            type="text" 
                                            className="form-control text-center" 
                                            style={{width: '60px'}}
                                            value={quantity}
                                            readOnly 
                                        />
                                        
                                        <button 
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={!currentVariant || quantity >= stock}
                                        > + </button>
                                    </div>
                                </div>


                                <div className="mt-3">
                                    <div>Giá:
                                        <span className="fw-bold text-danger ms-2">
                                            {/* ===== ĐÃ SỬA XUNG ĐỘT ===== */}
                                            {currentVariant ? (currentVariant.price * quantity).toLocaleString('vi-VN') : '...'}đ
                                            {/* ========================== */}
                                        </span>
                                    </div>
                                    <div>Tồn kho: {stock > 0 ? stock : 'Hết hàng'}
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
                            disabled={!currentVariant || isLoading || stock === 0} 
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}