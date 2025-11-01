import { useNavigate } from "react-router-dom";
import type { ProductType } from "../types/ProductType";
import { FaStar } from "react-icons/fa";
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
            style={{ cursor: "pointer", height: "340px", width: '220px' }}
        >
            <img
                src={product.image_url}
                alt={product.name}
                className="card-img-top"
                style={{ height: "200px" }}
            />
            <div className="d-flex flex-column mt-1 p-1">
                <span className="product-name cart-title text-start ms-1 fs fw-semibold">{product.name}</span>
                <small className="text-muted ms-1">
                    {product.category_name}
                </small>
                <div className="card-text text-start ms-1 fs-5 fw-bold text-primary">
                    {product.base_price.toLocaleString()}<small>đ</small>
                </div>
                <div className="text-muted ms-1 d-flex justify-content-between align-items-center">
                    <div>Đã bán: {product.sold_count}</div>
                    <div className="d-flex align-items-center">
                        <span>4.5</span>
                        <FaStar className="text-primary ms-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProductCard;
