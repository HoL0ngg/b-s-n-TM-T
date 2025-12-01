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

    const getImageUrl = (url: string | undefined) => {
        if (!url) return 'https://via.placeholder.com/220x200?text=No+Image';
        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    return (
        <div
            className="card shadow-sm position-relative"
            onClick={goToDetailProduct}
            style={{ cursor: "pointer", height: "340px", width: '220px' }}
        >
            {product.discount_percentage && (
                <div className="position-absolute top-0 start-0 m-1 p-2 rounded discount-hihi">
                    -{product.discount_percentage}%
                </div>
            )}

            <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="card-img-top"
                style={{ height: "200px" }} // Thêm objectFit để ảnh không bị méo

                // SỬA Ở ĐÂY: Chống vòng lặp lỗi (Infinite Loop)
                onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='200' viewBox='0 0 220 200'%3E%3Crect width='220' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' dominant-baseline='middle' text-anchor='middle'%3EImage Error%3C/text%3E%3C/svg%3E";
                    target.onerror = null;
                }}
            />

            <div className="d-flex flex-column mt-1 p-1">
                <span className="product-name cart-title text-start ms-1 fs fw-semibold">{product.name}</span>
                <small className="text-muted ms-1">
                    {product.category_name}
                </small>
                <div className="card-text text-start ms-1 fs-5">
                    {product.sale_price ?
                        (<div>
                            <span className="fw-bold text-primary">{Number(product.sale_price).toLocaleString('vi-VN')}<small>đ</small></span>
                            <small className="ms-2 text-muted text-decoration-line-through">{product.base_price.toLocaleString('vi-VN')}đ</small>
                        </div>) :
                        (<span className="fw-bold text-primary">{Number(product.base_price).toLocaleString('vi-VN')}<small>đ</small></span>)}

                </div>
                <div className="text-muted ms-1 d-flex justify-content-between align-items-center">
                    <div>Đã bán: {product.sold_count}</div>
                    <div className="d-flex align-items-center">
                        <span>{product?.avg_rating ? Number(product.avg_rating).toFixed(1) : 0}</span>
                        <FaStar className="text-primary ms-1" />
                    </div>
                </div>
            </div>
        </div >
    );
};
export default ProductCard;