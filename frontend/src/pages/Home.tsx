import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Banner from "../components/Banner";
import CategorySelector from "../components/CategorySelector";
import LazySection from "../components/LazySection";


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
            <LazySection threshold={0.2} animation="slide-left">
                <Banner />
            </LazySection>
            <LazySection threshold={0.5}>
                <CategorySelector categories={categories} />
            </LazySection>
        </>
    );
}
