import type { ProductType } from "../types/ProductType"

export default function ProductInfo({ product }: { product: ProductType }) {
    if (!product) return null;
    {
        return (
            <div className="container">
                <div className="nameOfProduct mt-2"><h2>{product.name}</h2></div>
                <div className="">
                    {product.description}
                </div>
                <div className="mt-2 d-flex align-items-center gap-3">
                    <div className="text-muted">Số lượng</div>
                    <div className="d-flex mt-1 mb-1">
                        <div className="border px-2">-</div>
                        <input type="text" className="text-center text-primary border" value={1} readOnly style={{ outline: "none", width: "60px" }} />
                        <div className="border px-2">+</div>
                    </div>
                    <div className="text-muted">696 Sản phẩm có sẵn</div>
                </div>
                <div className="priceOfProduct fw-semibold fs-4 custom-text-orange"><span>{product.base_price.toLocaleString()}đ</span></div>
            </div>
        )
    }
}