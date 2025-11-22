import { useCart } from "../context/CartContext";
import type { ProductType, AttributeOfProductVariantsType } from "../types/ProductType";
import { useState, useMemo, useEffect } from "react";

interface ProductInfoProps {
    product: ProductType,
    attributes: AttributeOfProductVariantsType[],
    onVariantImageChange: (imageUrl: string) => void;
}

export default function ProductInfo({ product, attributes, onVariantImageChange }: ProductInfoProps) {
    const { AddToCart } = useCart();
    const [count, setCount] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});

    // ===== HÀM XỬ LÝ ẢNH (MỚI) =====
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        // Nếu là ảnh upload (backend) -> thêm localhost
        if (url.startsWith('/uploads')) {
            return `http://localhost:5000${url}`;
        }
        // Ảnh cũ -> Giữ nguyên
        return url;
    };
    // ==============================

    const currentVariant = useMemo(() => {
        if (!attributes || Object.keys(selectedAttributes).length !== attributes.length) {
            return undefined;
        }
        return product.product_variants?.find(variant =>
            variant.options.every(option =>
                selectedAttributes[option.attribute] === option.value
            )
        );
    }, [selectedAttributes, product.product_variants, attributes]); 

    useEffect(() => {
        if (currentVariant && currentVariant.image_url) {
            // SỬA: Dùng getImageUrl để đảm bảo đường dẫn đúng
            onVariantImageChange(getImageUrl(currentVariant.image_url));
        }
        console.log(currentVariant);
    }, [currentVariant, onVariantImageChange]);

    const increment = () => {
        const maxStock = currentVariant ? currentVariant.stock : 100; 
        if (count < maxStock) {
            setCount(prev => prev + 1);
        }
    }
    const decrement = () => {
        if (count > 1) {
            setCount(prev => prev - 1);
        }
    }

    const handleAddCart = async () => {
        if (!currentVariant) {
            alert("Vui lòng chọn đầy đủ tùy chọn sản phẩm.");
            return;
        }
        if (count > currentVariant.stock) {
            alert(`Rất tiếc, số lượng tồn kho cho tùy chọn này chỉ còn ${currentVariant.stock}.`);
            return;
        }
        const res = await AddToCart(currentVariant.id, count);
        console.log(res);
    }

    const handleSelectAttribute = (attrName: string, val: string) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [attrName]: val
        }));
        setCount(1);
        console.log(currentVariant);
    }

    if (!product) return <div>Đang tải chi tiết sản phẩm</div>;
    console.log(product);
    const hasPriceRange = product.min_price !== product.max_price;

    return (
        <div className="container">
            <div className="nameOfProduct mt-2"><h2>{product.name}</h2></div>
            <div className="">
            </div>

            <div className="priceOfProduct ">
                <span>
                    {currentVariant
                        ? (
                            <div>
                                {currentVariant.sale_price && currentVariant.discount_percentage ? (<span><span className="fw-semibold fs-3 text-primary">{Number(currentVariant.sale_price).toLocaleString('vi-VN')}đ</span>
                                    <small className="text-muted text text-decoration-line-through ms-2">{product.base_price.toLocaleString('vi-VN')}đ</small>
                                    <span className="ms-2 p-2 discount-hihi rounded">-{currentVariant.discount_percentage}%</span></span>) : (<span className="fw-semibold fs-3 text-primary"> {currentVariant.original_price.toLocaleString('vi-VN')}đ</span>)}
                            </div>)
                        : (hasPriceRange ? (
                            <span className="fw-semibold fs-3 text-primary">
                                {Number(product.min_price).toLocaleString('vi-VN')}₫ - {Number(product.max_price).toLocaleString('vi-VN')}₫
                                {product.discount_percentage && (<span className="ms-2 p-2 discount-hihi rounded fs-6">-{product.discount_percentage}%</span>)}
                            </span>
                        ) : (
                            <span className="fw-semibold fs-3 text-primary">
                                {Number(product.min_price).toLocaleString('vi-VN')}₫
                                {product.discount_percentage && (<span className="ms-2 p-2 discount-hihi rounded fs-6">-{product.discount_percentage}%</span>)}
                            </span>
                        ))}
                </span>
            </div >

            <div>
                {attributes.map((attr) => (
                    <div key={attr.attribute}>
                        <div className="mb-1 fw-semibold fs-5">{attr.attribute}</div>
                        <div className="d-flex align-items-center gap-2">
                            {attr.values.map((val) => {
                                // --- TÌM ẢNH CỦA BIẾN THỂ (NẾU CÓ) ---
                                // Logic: Tìm biến thể nào có (attribute=attr.attribute & value=val)
                                // Lưu ý: Logic này chỉ đúng nếu 1 thuộc tính đại diện cho 1 ảnh (ví dụ Màu Sắc).
                                // Nếu kết hợp nhiều thuộc tính thì phức tạp hơn.
                                // Ở đây ta tạm thời tìm biến thể ĐẦU TIÊN khớp với giá trị này để lấy ảnh.
                                const variantForImage = product.product_variants?.find(v => 
                                    v.options.some(opt => opt.attribute === attr.attribute && opt.value === val)
                                    && v.image_url // Chỉ lấy nếu có ảnh
                                );
                                const imgUrl = variantForImage ? getImageUrl(variantForImage.image_url) : null;
                                // -------------------------------------

                                return (
                                    <div
                                        className={`rounded py-1 px-3 pointer d-flex align-items-center gap-2 ${selectedAttributes[attr.attribute] === val ? "border-product-attribute" : "bg-secondary-subtle"}`}
                                        key={val}
                                        onClick={() => handleSelectAttribute(attr.attribute, val)}
                                    >
                                        {/* HIỂN THỊ ẢNH BIẾN THỂ NHỎ (NẾU CÓ) */}
                                        {imgUrl && (
                                            <img 
                                                src={imgUrl} 
                                                alt={val} 
                                                style={{width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px'}}
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        )}
                                        {val}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="my-2 d-flex align-items-center gap-3">
                <div className="text-muted">Số lượng</div>
                <div className="d-flex my-1 border rounded-pill">
                    <div className="px-2 py-1 pointer" onClick={decrement}><i className="fa-solid fa-minus"></i></div>
                    <input type="text" className="text-center text-primary" value={count} readOnly style={{ outline: "none", width: "50px", border: "none" }} />
                    <div className="px-2 py-1 pointer" onClick={increment}><i className="fa-solid fa-plus"></i></div>
                </div>

                <div className="text-muted">
                    {currentVariant
                        ? `${currentVariant.stock} sản phẩm có sẵn`
                        : (product.sold_count ? `${product.sold_count} đã bán` : '')
                    }
                </div>
            </div>

            <div className="d-flex gap-4 align-items-center">
                <button
                    className="custom-button-addtocart rounded-pill w-50"
                    onClick={handleAddCart}
                >
                    Thêm vào giỏ hàng
                </button>
                <button className="custom-button-buynow rounded-pill w-50">
                    Mua ngay
                </button>
            </div>
        </div >
    )
}