
type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
}

type ProductInfoProps = {
    product?: Product;
}
const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    if (!product) return <p>Không có thông tin sản phẩm</p>
    return (
        <div className="container">
            <div className="nameOfProduct mt-2"><h2>{product.name}</h2></div>
            <div className="priceOfProduct fw-semibold fs-4 custom-text-orange"><span>{product.price.toLocaleString()}</span></div>
        </div>
    )
}

export default ProductInfo;
