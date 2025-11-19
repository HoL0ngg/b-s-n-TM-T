import { useNavigate } from "react-router-dom";
import type { CategoryType } from "../types/CategoryType";

type CategoryItemProps = {
  category: CategoryType;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div className="col text-center d-flex flex-column align-items-center">
      <div className="rounded-circle shadow d-flex align-items-center pointer" style={{ height: '160px', width: '160px' }} onClick={() => navigate(`/category/${category.id}`)}>
        <img
          src={category.img_url}
          alt={category.name}
          style={{
            aspectRatio: "1 / 1",
            objectFit: "cover",
            width: "100%",
            maxWidth: "100px",
            margin: "0 auto",
          }}
        />
      </div>
      <p className="mt-2">{category.name}</p>
    </div>
  );
};

export default CategoryItem;
