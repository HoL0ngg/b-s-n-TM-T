import { useParams } from "react-router-dom";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import { categories } from "../data/products";
const Category = () => {
  const { name } = useParams<{ name: string }>();

  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase() === name?.toLowerCase()
  );

  const filteredNameOfCategory = categories.find(
    (cat) => cat.id.toLowerCase() === name?.toLowerCase()
  );

  return (
    <div className="container">
      <CategorySwiper categories={categories} />
      <div className="container my-3">
        <div className="row">
          <div className="col-lg-3 col-md-4 col-12">
            <div className="border-top p-3 m-2">
              <h5>Danh mục sản phẩm</h5>
              <ul className="list-unstyled">
                <li className="nav-link">Hihihi</li>
                <li>Hihihi</li>
                <li>Hihihi</li>
                <li>Hihihi</li>
                <li>Hihihi</li>
              </ul>
            </div>
            <div className="border-top p-3 m-2">
              <h5>Khoảng giá</h5>
              <input
                type="text"
                className="form-control form-control-sm mt-2"
                placeholder="Từ"
                id="fromMoney"
              />
              <input
                type="text"
                className="form-control form-control-sm mt-2"
                placeholder="Đến"
                id="toMoney"
              />
            </div>
          </div>
          <div className="col-lg-9 col-md-8 col-12">
            <div className="row row-cols-1 row-cols-md-2 g-4">
              <h2 className="mb-4 text-left">
                {filteredNameOfCategory?.name ?? "Danh mục không tồn tại"}
              </h2>
              <div className="">
                <span className="fs-5 text-right me-3">Sắp xếp theo: </span>
                <select name="sortBy" id="sortBy" className="custom-select">
                  <option value="default" selected>
                    Mặc định
                  </option>
                  <option value="priceDescrease">Giá giảm dần</option>
                  <option value="priceIncrease">Giá tăng dần</option>
                </select>
              </div>
            </div>
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div className="col" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="w-100">
                  <p className="text-center fs-5">
                    Không có sản phẩm nào trong danh mục
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
