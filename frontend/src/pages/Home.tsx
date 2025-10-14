import Banner from "../components/Banner";
import CategorySelector from "../components/CategorySelector";
import LazySection from "../components/LazySection";
// import { categories } from "../data/products";
import { fetchCategories } from "../api/categories";
import { useEffect, useState } from "react";
import type { CategoryType } from "../types/CategoryType";

export default function Home() {
    const [Categories, setCategories] = useState<CategoryType[]>([]);
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
