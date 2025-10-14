import Banner from "../components/Banner";
import CategorySelector from "../components/CategorySelector";
import LazySection from "../components/LazySection";
// import { categories } from "../data/products";
import { fetchCategories } from "../api/categories";
import { useEffect, useState } from "react";
import type { Category } from "../types/Category";

export default function Home() {
    const [Categories, setCategories] = useState<Category[]>([]);
    const [Error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                console.log(data);

                setCategories(data);
            } catch (err) {
                setError("Không thể tải danh mục 😢");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);


    return (
        <>
            <LazySection threshold={0.2} animation="slide-left">
                <Banner />
            </LazySection>
            <LazySection threshold={0.5}>
                <CategorySelector categories={Categories} />
            </LazySection>
        </>
    );
}
