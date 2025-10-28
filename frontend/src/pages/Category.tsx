import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import type { CategoryType } from "../types/CategoryType";
import type { ProductType } from "../types/ProductType";
import { fetchCategories } from "../api/categories";
import { fecthProducts } from "../api/products";
import { useEffect, useState } from "react";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";
import { useStepContext } from "@mui/material/Step";
const Category = () => {
  const { id } = useParams<{ id: string }>();
  const [Categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fecthProducts(Number(id), currentPage, 2);

      // console.log(res);
      setProducts(res.data)
      setTotalPages(res.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    loadProducts();
  }, [id]);
  useEffect(() => {
    loadProducts();
  }, [currentPage]);
  const filteredNameOfCategory = Categories.find(
    (cat) => cat.id == Number(id)
  );

  return (
    <div className="container">
      <CategorySwiper categories={Categories} />
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
              <div className="mb-3">
                <span className="fs-5 text-right me-3">Sắp xếp theo: </span>
                <select name="sortBy" id="sortBy" className="custom-select">
                  <option value="default">
                    Mặc định
                  </option>
                  <option value="priceDescrease">Giá giảm dần</option>
                  <option value="priceIncrease">Giá tăng dần</option>
                </select>
              </div>
            </div>
            <div className="row row-cols-1 row-cols-md-4 g-4">
              {loading && (
                <div className="loader-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              {products.length > 0 ? (
                products.map((product) => (
                  <div className="col" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="w-100">
                  <p className="text-center fs-5">
                    Không có sản phẩm
                  </p>
                </div>
              )}
            </div>
            <div className="d-flex align-items-center justify-content-center mt-4 gap-2">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                style={{ background: "none", border: "none" }}
              >
                <FaLessThan />
              </button>

              {/* Pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 5) // chỉ render tối đa 5 nút đầu
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
          ${currentPage === page
                        ? "pagenum-active"
                        : "pagenum-nonactive"
                      } `}
                  >
                    {page}
                  </button>
                ))}

              {/* Dots nếu còn trang */}
              {totalPages > 5 && <span className="px-2">...</span>}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                style={{ background: "none", border: "none" }}
              >
                <FaGreaterThan />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
