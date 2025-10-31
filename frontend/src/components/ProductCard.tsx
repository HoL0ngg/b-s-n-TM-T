import { useNavigate } from "react-router-dom";
import type { ProductType } from "../types/ProductType";
type ProductCardProps = {
    product: ProductType;
};

const ProductCard = ({ product }: ProductCardProps) => {
    const navigate = useNavigate();
    const goToDetailProduct = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div
            className="card shadow-sm"
            onClick={goToDetailProduct}
            style={{ cursor: "pointer", height: "350px" }}
        >
            <img
                src={product.image_url}
                alt={product.name}
                className="card-img-top"
                style={{ height: "200px" }}
            />
            <div className="d-flex flex-column mt-2 gap-2 p-1">
                <span className="product-name cart-title text-center fs-5">{product.name}</span>
                <p className="card-text text-center fs-5 fw-bold">
                    {product.base_price.toLocaleString()} VNĐ
                </p>
                {/* <button className="btn btn-outline-orange mt-auto fw-semibold">
          Add to Cart
        </button> */}
            </div>
            <div className="container text-muted">Đã bán: {product.sold_count}</div>
        </div>
    );
};
export default ProductCard;
