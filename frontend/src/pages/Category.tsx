import { useParams } from "react-router-dom";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import { categories } from "../data/products";
const Category = () => {
    const {name} = useParams<{name : string}>();

    const filteredProducts = products.filter(
        (p) => p.category.toLowerCase() === name?.toLowerCase()
    );

    const filteredNameOfCategory = categories.find(
        (cat) => cat.id.toLowerCase() === name?.toLowerCase()

    );
    
    return(
        <div className="container">
            <CategorySwiper categories={categories}/> 
            <div className="row row-cols-1 row-cols-md-2 g-4 w">
                <h2 className="mb-4 text-left">{filteredNameOfCategory?.name ?? "Danh mục không tồn tại"}</h2>
                <div>
                    <span className="fs-5">Sắp xếp theo: </span>
                </div>
            </div>
            <div className="row row-cols-1 row-cols-md-4 g-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div className="col" key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    )) 
                ): (
                    <p className="text-center">Không có sản phẩm nào trong danh mục</p>
                )}
            </div>
        </div>


    )
}

export default Category;