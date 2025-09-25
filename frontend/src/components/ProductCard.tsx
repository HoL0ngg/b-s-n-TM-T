type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
}

type ProductCardProps = {
    product: Product;
}

const ProductCard = ({product} : ProductCardProps) => {
    return (
        <div className="card h-100 shadow-sm">
            <img 
                src={product.image} 
                alt={product.name} className="card-img-top" 
                style={{ objectFit: "cover", height: "200px" }}/>
            <div className="card-body d-flex flex-column">
                <h5 className="cart-title text-center fs-3">{product.name}</h5>
                <p className="card-text text-center fs-5">{product.price.toLocaleString()} VNĐ</p>
                 <button className="btn btn-outline-primary mt-auto">Add to Cart</button>
            </div>
        </div>
    )
}
export default ProductCard;