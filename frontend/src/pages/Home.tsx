import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import CategorySelector from "../components/CategorySelector";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const categories = [
        { name: "Quần", image: "/assets/logo.jpg" },
        { name: "Áo", image: "/assets/logo.jpg" },
        { name: "Giày", image: "/assets/logo.jpg" }
    ];

    useEffect(() => {
        // Tạm hardcode dữ liệu, sau này sẽ fetch từ backend
        setProducts([
            { id: 1, name: "Laptop Dell XPS", price: 25000000, image: "/assets/react.svg" },
            { id: 2, name: "iPhone 15 Pro", price: 32000000, image: "/assets/react.svg" },
            { id: 3, name: "Tai nghe Sony", price: 3500000, image: "/assets/react.svg" },
        ]);
    }, []);

    return (
        <>
            <Banner />
            <CategorySelector categories={categories} />
        </>
    );
}
