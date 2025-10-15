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
                <div className="priceOfProduct fw-semibold fs-4 custom-text-orange"><span>{product.base_price.toLocaleString()}đ</span></div>
            </div>
        )
    }
}