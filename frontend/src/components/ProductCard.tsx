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
      style={{ cursor: "pointer", height: "400px" }}
    >
      <img
        src={product.image_url}
        alt={product.name}
        className="card-img-top"
        style={{ objectFit: "cover", height: "200px" }}
      />
      <div className="card-body d-flex flex-column mt-1">
        <h5 className="cart-title text-center fs-4">{product.name}</h5>
        <p className="card-text text-center fs-5">
          {product.base_price.toLocaleString()} VNĐ
        </p>
        {/* <button className="btn btn-outline-orange mt-auto fw-semibold">
          Add to Cart
        </button> */}
      </div>
    </div>
  );
};
export default ProductCard;
