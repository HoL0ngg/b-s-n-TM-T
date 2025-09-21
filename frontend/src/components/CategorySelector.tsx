import { useNavigate } from "react-router-dom";

type Category = {
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
                {categories.map((cat, index) => (
                    <div className="col text-center" key={index} onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)} style={{
                        cursor: "pointer"
                    }}>
                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="img-fluid rounded-circle shadow-sm"
                            style={{
                                aspectRatio: "1 / 1",  // width : height = 1:1
                                objectFit: "cover",    // cắt gọn ảnh cho vừa khung
                                width: "100%",         // chiếm toàn bộ chiều rộng cột
                                maxWidth: "150px",     // nhưng không vượt quá 150px
                            }}
                        />
                        <p className="mt-2">{cat.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelector;