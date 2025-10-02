import { useNavigate } from "react-router-dom";
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
};

type ProductCardProps = {
  product: Product;
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
      style={{ minHeight: "200px", cursor: "pointer" }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="card-img-top"
        style={{ objectFit: "cover", height: "200px" }}
      />
      <div className="card-body d-flex flex-column mt-5">
        <h5 className="cart-title text-center fs-4">{product.name}</h5>
        <p className="card-text text-center fs-5">
          {product.price.toLocaleString()} VNĐ
        </p>
        {/* <button className="btn btn-outline-orange mt-auto fw-semibold">
          Add to Cart
        </button> */}
      </div>
    </div>
  );
};
export default ProductCard;
