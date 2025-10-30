import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategorySwiper from "../components/CategorySwiper";
import type { CategoryType, SubCategoryType } from "../types/CategoryType";
import type { ProductType } from "../types/ProductType";
import { fetchCategories, fetchSubCategories } from "../api/categories";
import { fecthProducts, fetchProductsInPriceOrder } from "../api/products";
import { useEffect, useState } from "react";
import { FaLessThan, FaGreaterThan } from "react-icons/fa6";
const Category = () => {
  const { id } = useParams<{ id: string }>();
  const [Categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [typeOfSort, setTypeOfSort] = useState<string>("default");
  const [subCategories, setSubCategories] = useState<SubCategoryType[]>([]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fecthProducts(Number(id), currentPage, 12);
      setProducts(res.data)
      setTotalPages(res.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const loadSubCategories = async () => {
    try {
      const res = await fetchSubCategories(Number(id));
      console.log(res);
      setSubCategories(res);
    } catch (error) {
      console.log(error);

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
    loadSubCategories();
    loadCategories();
    loadProducts();
    setCurrentPage(1);
    setTypeOfSort("default");
  }, [id]);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);
  const filteredNameOfCategory = Categories.find(
    (cat) => cat.id == Number(id)
  );

  const handleSort = async (val: string) => {
    setTypeOfSort(val);
    if (val === "default") {
      loadProducts();
      return;
    }
    const res = await fetchProductsInPriceOrder(Number(id), currentPage, 12, val);
    // const res = await fecthProducts(Number(id), currentPage, 3);
    setProducts(res.data);
    setTotalPages(res.totalPages);
  }

  return (
    <div className="container">
      <CategorySwiper categories={Categories} />
      <div className="container my-3">
        <div className="row">
          <div className="col-lg-3 col-md-4 col-12">
            <div className="border-top p-3 m-2">
              <h5>Danh mục sản phẩm</h5>
              <ul className="list-unstyled">
                {/* <li className="nav-link">Hihihi</li> */}
                <li>Son</li>
                <li>Sữa rửa mặt</li>
                <li>Kem</li>
                {/* <li>Hihihi</li> */}
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
                <select name="sortBy" id="sortBy" className="custom-select" value={typeOfSort} onChange={(e) => { handleSort(e.target.value) }}>
                  <option value="default">
                    Mặc định
                  </option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="priceAsc">Giá tăng dần</option>
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
              {products.length > 0 &&
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  style={{ background: "none", border: "none" }}
                >
                  <FaLessThan />
                </button>}

              {/* Smart Pages */}
              {(() => {
                let pages = [];

                if (totalPages <= 3) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else if (currentPage <= 3) {
                  pages.push(1, 2, 3);
                  pages.push("dots");
                  pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                  pages.push(1);
                  pages.push("dots");
                  for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);

                } else {
                  pages.push(1);
                  pages.push("dots");
                  pages.push(currentPage);
                  pages.push("dots");
                  pages.push(totalPages);
                }

                return pages.map((page, index) =>
                  page === "dots" ? (
                    <span key={`dots-${index}`} className="px-2">...</span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(Number(page))}
                      className={currentPage === page ? "pagenum-active" : "pagenum-nonactive"}
                    >
                      {page}
                    </button>
                  )
                );
              })()}

              {/* Next */}
              {products.length > 0 &&
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  style={{ background: "none", border: "none" }}
                >
                  <FaGreaterThan />
                </button>}
            </div>



          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
