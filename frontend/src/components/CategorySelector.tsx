import { useNavigate } from "react-router-dom";
import CategoryItem from "./CategoryItem";
type Category = {
    id: string;
    name: string;
    image: string;
};


type CategorySelectorProps = {
    categories: Category[];
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories }) => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ marginTop: '100px' }}>
            {/* Grid Bootstrap */}
            <div className="row row-cols-1 row-cols-md-4 g-4">
                {categories.map((cat) => (
                    <CategoryItem category={cat}/>
                ))}
            </div>
        </div>
    );
};

export default CategorySelector;