import { useEffect, useState } from "react";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Tạm hardcode dữ liệu, sau này sẽ fetch từ backend
        setProducts([
            { id: 1, name: "Laptop Dell XPS", price: 25000000, image: "/assets/react.svg" },
            { id: 2, name: "iPhone 15 Pro", price: 32000000, image: "/assets/react.svg" },
            { id: 3, name: "Tai nghe Sony", price: 3500000, image: "/assets/react.svg" },
        ]);
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Sản phẩm nổi bật</h2>
            <div className="row">
                {products.map((p) => (
                    <div key={p.id} className="col-md-4 mb-4">
                        <div className="card h-100">
                            <img src={p.image} className="card-img-top" alt={p.name} />
                            <div className="card-body">
                                <h5 className="card-title">{p.name}</h5>
                                <p className="card-text">{p.price.toLocaleString()} ₫</p>
                                <button className="btn btn-primary">Thêm vào giỏ</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
