import { useNavigate } from "react-router-dom";
import type { CategoryType } from "../types/CategoryType";

type CategoryItemProps = {
  category: CategoryType;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div className="col text-center">
      <img
        src={category.img_url}
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
        onClick={() => navigate(`/category/${category.id}`)}
      />
      <p className="mt-2">{category.name}</p>
    </div>
  );
};

export default CategoryItem;
