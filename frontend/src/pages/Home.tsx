import Banner from "../components/Banner";
import CategorySelector from "../components/CategorySelector";
import LazySection from "../components/LazySection";
import { categories } from "../data/products";
export default function Home() {
    

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
