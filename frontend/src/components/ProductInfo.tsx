import { useCart } from "../context/CartContext";
import type { ProductType } from "../types/ProductType"
import { useState } from "react";

export default function ProductInfo({ product }: { product: ProductType }) {
    const { AddToCart } = useCart();
    const [count, setCount] = useState(1);
    const increment = () => {
        setCount(prev => prev + 1);
    }
    const decrement = () => {
        if (count > 1) {
            setCount(prev => prev - 1);
        }
    }

    const handleAddCart = async () => {
        const res = await AddToCart(product.id, count);
        console.log(res);
    }

    if (!product) return <div>Đang tải chi tiết sản phẩm</div>;

    return (
        <div className="container">
            <div className="nameOfProduct mt-2"><h2>{product.name}</h2></div>
            <div className="">

            </div>
            <div className="mt-2 d-flex align-items-center gap-3">
                <div className="text-muted">Số lượng</div>
                <div className="d-flex my-1 border rounded-pill">
                    <div className="border-end px-2 py-1 pointer" onClick={decrement}><i className="fa-solid fa-minus"></i></div>
                    <input type="text" className="text-center text-primary" value={count} readOnly style={{ outline: "none", width: "50px", border: "none" }} />
                    <div className="border-start px-2 py-1 pointer" onClick={increment}><i className="fa-solid fa-plus"></i></div>
                </div>
                <div className="text-muted">{product.sold_count} Sản phẩm có sẵn</div>
            </div>
            <div className="priceOfProduct fw-semibold fs-4 custom-text-orange"><span>{product.base_price.toLocaleString()}đ</span></div>
            <div className="d-flex gap-4 align-items-center">
                <button className="custom-button-addtocart rounded-pill" onClick={handleAddCart}>
                    Thêm vào giỏ hàng
                </button>
                <button className="custom-button-buynow rounded-pill">
                    Mua ngay
                </button>
            </div>
        </div>
    )

}