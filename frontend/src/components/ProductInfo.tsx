
type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
}

type ProductInfoProps = {
    product: Product;
}
const ProductDetail: React.FC<ProductInfoProps> = ({ product }) => {
    return (
        <div className="container">
            <div className="nameOfProduct"><span>ten san pham</span></div>
            <div className="priceOfProduct"><span>gia</span></div>
        </div>
    )
}

export default ProductDetail;
