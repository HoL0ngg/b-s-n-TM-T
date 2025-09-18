import Banner from "../components/Banner";
import CategorySelector from "../components/CategorySelector";
import LazySection from "../components/LazySection";

export default function Home() {
    const categories = [
        { name: "Quần", image: "/assets/logo.jpg" },
        { name: "Áo", image: "/assets/logo.jpg" },
        { name: "Giày", image: "/assets/logo.jpg" }
    ];

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
