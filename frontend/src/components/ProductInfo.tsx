import { useCart } from "../context/CartContext";
// Giả sử ProductType của bạn có chứa 'product_variants'
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

    // --- THÊM MỚI: Logic cốt lõi để tìm biến thể ---
    const currentVariant = useMemo(() => {
        // Nếu chưa chọn đủ thuộc tính, không tìm
        if (!attributes || Object.keys(selectedAttributes).length !== attributes.length) {
            return undefined;
        }

        // Tìm trong danh sách biến thể của sản phẩm
        return product.product_variants?.find(variant =>
            // Kiểm tra xem MỌI tùy chọn của biến thể này
            variant.options.every(option =>
                // Có khớp với state 'selectedAttributes' không
                selectedAttributes[option.attribute] === option.value
            )
        );
    }, [selectedAttributes, product.product_variants, attributes]); // Tính toán lại khi 1 trong 3 thay đổi

    useEffect(() => {
        if (currentVariant && currentVariant.image_url) {
            // NẾU: tìm thấy biến thể VÀ có ảnh riêng
            // HÃY: Báo cho cha biết URL ảnh mới
            onVariantImageChange(currentVariant.image_url);
        }
        // (Không cần 'else', vì cha sẽ tự xử lý việc quay về ảnh chính)

    }, [currentVariant, onVariantImageChange]);

    const increment = () => {
        // --- SỬA LẠI: Kiểm tra tồn kho của biến thể ---
        const maxStock = currentVariant ? currentVariant.stock : 100; // Lấy tồn kho của biến thể
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

        // 2. Kiểm tra lại tồn kho (cho chắc)
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
        // Tùy chọn: Reset số lượng về 1 khi đổi tùy chọn
        setCount(1);
        console.log(currentVariant);

    }

    if (!product) return <div>Đang tải chi tiết sản phẩm</div>;
    console.log(product);


    return (
        <div className="container">
            <div className="nameOfProduct mt-2"><h2>{product.name}</h2></div>
            <div className="">
            </div>

            {/* --- SỬA LẠI: Hiển thị giá động --- */}
            <div className="priceOfProduct ">
                <span>
                    {/* Nếu tìm thấy biến thể thì hiển thị giá của nó, nếu không thì hiển thị giá gốc */}
                    {currentVariant
                        ? (
                            <div>
                                {currentVariant.sale_price && currentVariant.discount_percentage ? (<span><span className="fw-semibold fs-3 text-primary">{Number(currentVariant.sale_price).toLocaleString('vi-VN')}đ</span>
                                    <small className="text-muted text text-decoration-line-through ms-2">{product.base_price.toLocaleString('vi-VN')}đ</small>
                                    <span className="ms-2 p-2 discount-hihi rounded">-{currentVariant.discount_percentage}%</span></span>) : (<span className="fw-semibold fs-3 text-primary"> {currentVariant.original_price.toLocaleString('vi-VN')}đ</span>)}
                            </div>)
                        : (<span className="fw-semibold fs-3 text-primary">{product.base_price.toLocaleString('vi-VN')}đ</span>)}
                </span>
            </div>

            <div>
                {attributes.map((attr) => (
                    <div key={attr.attribute}>
                        <div className="mb-1 fw-semibold fs-5">{attr.attribute}</div>
                        <div className="d-flex align-items-center gap-2">
                            {attr.values.map((val) => (
                                <div
                                    className={`rounded py-1 px-3 pointer ${selectedAttributes[attr.attribute] === val ? "border-product-attribute" : "bg-secondary-subtle"}`}
                                    key={val}
                                    onClick={() => handleSelectAttribute(attr.attribute, val)}
                                >
                                    {val}
                                </div>
                            ))}
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