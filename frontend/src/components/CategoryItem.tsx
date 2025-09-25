import { useNavigate } from "react-router-dom";

type Category = {
    id: string;
    name: string;
    image: string;
}

type CategoryItemProps = {
  category: Category;
};

const CategoryItem: React.FC<CategoryItemProps> = ({category}) => {
    const navigate = useNavigate();

    return (
    <div className="col text-center" key={category.id} >
      <img
        src={category.image}
        alt={category.name}
        className="img-fluid rounded-circle shadow-sm"
        style={{
          aspectRatio: "1 / 1",
          objectFit: "cover",
          width: "100%",
          maxWidth: "150px",
          margin: "0 auto",
          cursor: "pointer",
        }}
        onClick={() => navigate(`/category/${category.id.toLowerCase()}`)}
      />
      <p className="mt-2">{category.name}</p>
    </div>
    );
}

export default CategoryItem;